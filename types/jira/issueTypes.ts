export interface Issue {
  id: string;
  key: string;
  fields: {
    summary: string;
    description: string;
    status: {
      name: string;
      statusCategory: {
        colorName: 'blue-gray' | 'yellow' | 'green' | 'default';
        self: string;
      };
    };
  }
};
