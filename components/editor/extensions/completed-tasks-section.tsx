import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';

// React component for rendering the completed tasks section
const CompletedTasksSectionComponent = (props: any) => {
  const { node, updateAttributes } = props;
  const isExpanded = node.attrs.expanded;
  const count = node.attrs.count || 0;

  const toggleExpanded = () => {
    updateAttributes({ expanded: !isExpanded });
  };

  return (
    <NodeViewWrapper className="completed-tasks-section">
      <div
        className="completed-tasks-header"
        onClick={toggleExpanded}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleExpanded();
          }
        }}
      >
        <span className="completed-tasks-toggle">
          {isExpanded ? '▼' : '▶'}
        </span>
        <span className="completed-tasks-title">
          Completed Tasks
        </span>
        {count > 0 && (
          <span className="completed-tasks-count">
            ({count})
          </span>
        )}
      </div>
      {isExpanded && (
        <div className="completed-tasks-content">
          <NodeViewContent className="completed-tasks-list" />
        </div>
      )}
    </NodeViewWrapper>
  );
};

export const CompletedTasksSection = Node.create({
  name: 'completedTasksSection',

  group: 'block',

  content: 'taskList',

  isolating: true,

  defining: true,

  addAttributes() {
    return {
      expanded: {
        default: true,
        parseHTML: element => {
          const expanded = element.getAttribute('data-expanded');
          return expanded === 'false' ? false : true;
        },
        renderHTML: attributes => {
          return {
            'data-expanded': attributes.expanded,
          };
        },
      },
      count: {
        default: 0,
        parseHTML: element => {
          return parseInt(element.getAttribute('data-count') || '0', 10);
        },
        renderHTML: attributes => {
          return {
            'data-count': attributes.count,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="completed-tasks-section"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'completed-tasks-section',
        class: 'completed-tasks-section',
      }),
      ['div', { class: 'completed-tasks-content' }, 0],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CompletedTasksSectionComponent);
  },
});
