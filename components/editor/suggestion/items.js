const getSuggestionItems = () => {
  return [
    {
      title: "H1",
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("heading", { level: 1 })
          .run();
      }
    },
    {
      title: "H2",
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("heading", { level: 2 })
          .run();
      }
    },
    {
      title: "bold",
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setMark("bold").run();
      }
    },
    {
      title: "italic",
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setMark("italic").run();
      }
    },
    {
      title: "todo",
      command: ({ editor, range }) => {
        editor.commands.toggleTaskList();
        editor.chain().focus().deleteRange(range).run();
        // editor.chain().focus().deleteRange(range).setNode("todo_item").run();
      }
    },
  ];
    // .filter((item) => {
    //   if (!query) {
    //     return true;
    //   }
    //   item.title.toLowerCase().startsWith(query.toLowerCase())
    // })
    // .slice(0, 10);
};

export default getSuggestionItems;
