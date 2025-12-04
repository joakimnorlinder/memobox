import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Slice, Fragment } from '@tiptap/pm/model';

export const AutoArchiveTasks = Extension.create({
  name: 'autoArchiveTasks',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('autoArchiveTasks'),

        appendTransaction: (transactions, oldState, newState) => {
          // Only process if the document changed
          if (!transactions.some(tr => tr.docChanged)) {
            return null;
          }

          const { doc, schema, tr } = newState;
          let modified = false;

          // Find all task items and check if their checked state changed
          const checkedChanges: Array<{
            pos: number;
            node: ProseMirrorNode;
            wasChecked: boolean;
            isChecked: boolean;
          }> = [];

          // Compare old and new states to find changed task items
          doc.descendants((node, pos) => {
            if (node.type.name === 'taskItem') {
              const oldNode = oldState.doc.nodeAt(pos);
              if (oldNode && oldNode.attrs.checked !== node.attrs.checked) {
                checkedChanges.push({
                  pos,
                  node,
                  wasChecked: oldNode.attrs.checked,
                  isChecked: node.attrs.checked,
                });
              }
            }
          });

          // Process each changed task item
          if (checkedChanges.length > 0) {
            // We need to process these in reverse order to maintain positions
            const sortedChanges = checkedChanges.sort((a, b) => b.pos - a.pos);

            for (const change of sortedChanges) {
              if (change.isChecked && !change.wasChecked) {
                // Task was just checked - move to completed section
                modified = moveToCompletedSection(tr, change.pos, change.node) || modified;
              } else if (!change.isChecked && change.wasChecked) {
                // Task was just unchecked - move back to active section
                modified = moveToActiveSection(tr, change.pos, change.node) || modified;
              }
            }

            if (modified) {
              // Update the count in the completed section
              updateCompletedCount(tr);
              return tr;
            }
          }

          return null;
        },
      }),
    ];
  },
});

// Helper function to extract a task item and its entire subtree
function extractTaskSubtree(doc: ProseMirrorNode, pos: number): {
  node: ProseMirrorNode;
  size: number;
} {
  const node = doc.nodeAt(pos);
  if (!node || node.type.name !== 'taskItem') {
    return { node: doc.type.schema.nodes.taskItem.create(), size: 0 };
  }

  // Return the entire task item node and its size
  return {
    node: node,
    size: node.nodeSize,
  };
}

// Move a checked task to the completed section
function moveToCompletedSection(tr: any, taskPos: number, taskNode: ProseMirrorNode): boolean {
  const { doc } = tr;
  const schema = doc.type.schema;

  // Find or create completed section
  let completedSectionPos = -1;
  let completedSectionNode: ProseMirrorNode | undefined;

  doc.descendants((node: ProseMirrorNode, pos: number) => {
    if (node.type.name === 'completedTasksSection') {
      completedSectionPos = pos;
      completedSectionNode = node;
      return false; // Stop searching
    }
  });

  // Extract the task and its subtree
  const { node: taskItemNode, size } = extractTaskSubtree(doc, taskPos);

  // Find the parent task list of this task to check if it will be empty after deletion
  let parentTaskListPos = -1;
  let parentTaskListSize = 0;
  let parentTaskListChildCount = 0;

  doc.descendants((node: ProseMirrorNode, pos: number) => {
    if (node.type.name === 'taskList') {
      const listEnd = pos + node.nodeSize;
      if (taskPos > pos && taskPos < listEnd) {
        parentTaskListPos = pos;
        parentTaskListSize = node.nodeSize;
        parentTaskListChildCount = node.childCount;
        return false; // Found the parent, stop searching
      }
    }
  });

  if (completedSectionNode && completedSectionPos >= 0) {
    // Append to existing completed section's task list
    const taskListPos = completedSectionPos + 1; // Skip the section node opening token
    const taskList = completedSectionNode.firstChild;

    if (taskList && taskList.type.name === 'taskList') {
      // Check if we need to delete the parent task list (if it will be empty)
      const shouldDeleteParentList = parentTaskListPos >= 0 && parentTaskListChildCount === 1;

      if (shouldDeleteParentList) {
        // Delete the entire empty task list
        tr.delete(parentTaskListPos, parentTaskListPos + parentTaskListSize);

        // Insert at the end of the completed task list
        // Adjust position since we deleted the parent list
        const insertPos = taskListPos + 1 + taskList.content.size;
        const adjustedInsertPos = insertPos - parentTaskListSize;
        tr.insert(adjustedInsertPos, taskItemNode);
      } else {
        // Just delete the task item
        tr.delete(taskPos, taskPos + size);

        // Insert at the end of the task list content (after opening token + content)
        // Adjust insert position since we deleted before it (task is always before completed section)
        const insertPos = taskListPos + 1 + taskList.content.size;
        const adjustedInsertPos = insertPos - size;
        tr.insert(adjustedInsertPos, taskItemNode);
      }

      return true;
    }
  } else {
    // Create new completed section at the end of the document
    const completedTasksSection = schema.nodes.completedTasksSection;
    const taskList = schema.nodes.taskList;

    if (!completedTasksSection || !taskList) {
      return false;
    }

    // Check if we need to delete the parent task list (if it will be empty)
    const shouldDeleteParentList = parentTaskListPos >= 0 && parentTaskListChildCount === 1;

    // Create a task list with the checked task
    const newTaskList = taskList.create(null, [taskItemNode]);
    const newSection = completedTasksSection.create(
      { expanded: true, count: 1 },
      newTaskList
    );

    if (shouldDeleteParentList) {
      // Delete the entire empty task list first
      tr.delete(parentTaskListPos, parentTaskListPos + parentTaskListSize);

      // Insert at the end of the document (adjusted position since we deleted before)
      const endPos = doc.content.size - parentTaskListSize;
      tr.insert(endPos, newSection);
    } else {
      // Just delete the task from its current position
      tr.delete(taskPos, taskPos + size);

      // Insert at the end of the document (adjusted position since we deleted before)
      const endPos = doc.content.size - size;
      tr.insert(endPos, newSection);
    }

    return true;
  }

  return false;
}

// Move an unchecked task back to the active section
function moveToActiveSection(tr: any, taskPos: number, taskNode: ProseMirrorNode): boolean {
  const { doc } = tr;
  const schema = doc.type.schema;

  // Extract the task and its subtree
  const { node: taskItemNode, size } = extractTaskSubtree(doc, taskPos);

  // Check if this task is inside the completed section
  let isInCompletedSection = false;
  let completedSectionPos = -1;
  let completedSectionNode: ProseMirrorNode | undefined;
  let completedSectionSize = 0;

  doc.descendants((node: ProseMirrorNode, pos: number) => {
    if (node.type.name === 'completedTasksSection') {
      const sectionEnd = pos + node.nodeSize;
      if (taskPos >= pos && taskPos < sectionEnd) {
        isInCompletedSection = true;
        completedSectionPos = pos;
        completedSectionNode = node;
        completedSectionSize = node.nodeSize;
        return false;
      }
    }
  });

  if (!isInCompletedSection) {
    // Task is not in completed section, no need to move
    return false;
  }

  // Check if the completed section will be empty after removing this task
  const completedTaskList = completedSectionNode?.firstChild;
  const willBeEmpty = completedTaskList && completedTaskList.childCount === 1;

  // Find the last active task list (before completed section)
  let lastTaskListPos = -1;
  let lastTaskListNode: ProseMirrorNode | undefined;

  doc.descendants((node: ProseMirrorNode, pos: number) => {
    if (node.type.name === 'taskList' && pos < completedSectionPos) {
      lastTaskListPos = pos;
      lastTaskListNode = node;
    }
  });

  if (lastTaskListNode && lastTaskListPos >= 0) {
    if (willBeEmpty) {
      // Delete the entire completed section
      tr.delete(completedSectionPos, completedSectionPos + completedSectionSize);

      // Append to the last active task list (before its closing token)
      // No adjustment needed since we deleted from after the insert position
      const insertPos = lastTaskListPos + 1 + lastTaskListNode.content.size;
      tr.insert(insertPos, taskItemNode);
    } else {
      // Just delete the task from completed section
      tr.delete(taskPos, taskPos + size);

      // Append to the last active task list (before its closing token)
      // No adjustment needed since we deleted from after the insert position
      const insertPos = lastTaskListPos + 1 + lastTaskListNode.content.size;
      tr.insert(insertPos, taskItemNode);
    }

    return true;
  } else {
    // No active task list found, create a new one before the completed section
    const taskList = schema.nodes.taskList;
    if (!taskList) {
      return false;
    }

    if (willBeEmpty) {
      // Delete the entire completed section
      tr.delete(completedSectionPos, completedSectionPos + completedSectionSize);

      // Create and insert the new task list where the completed section was
      const newTaskList = taskList.create(null, [taskItemNode]);
      tr.insert(completedSectionPos, newTaskList);
    } else {
      // Just delete from completed section
      tr.delete(taskPos, taskPos + size);

      // Create and insert the new task list before the completed section
      // No adjustment needed since we deleted from after the insert position
      const newTaskList = taskList.create(null, [taskItemNode]);
      tr.insert(completedSectionPos, newTaskList);
    }

    return true;
  }
}

// Update the count attribute of the completed section
function updateCompletedCount(tr: any): void {
  const { doc } = tr;

  doc.descendants((node: ProseMirrorNode, pos: number) => {
    if (node.type.name === 'completedTasksSection') {
      // Count the number of task items in the section
      let count = 0;
      node.descendants((child: ProseMirrorNode) => {
        if (child.type.name === 'taskItem') {
          count++;
        }
      });

      // Update the count attribute if it changed
      if (node.attrs.count !== count) {
        tr.setNodeMarkup(pos, null, { ...node.attrs, count });
      }

      // If count is 0, we might want to remove the section
      if (count === 0) {
        tr.delete(pos, pos + node.nodeSize);
      }

      return false; // Stop after finding the first (and only) completed section
    }
  });
}
