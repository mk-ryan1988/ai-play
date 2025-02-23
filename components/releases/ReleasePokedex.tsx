import { useState } from 'react';
import Combobox from '@/components/ui/Combobox';

export default function ReleasePokedex(
  { onSelect }: { onSelect: (name: string) => void }
) {
  const [items] = useState<Array<{ id: number; name: string }>>([]);

  const handleSearch = async (query: string) => {
    if (!query) return [];
    const response = await fetch(`/api/pokemon?name=${query}`);
    const data = await response.json();
    if (data.error) {
      return [];
    } else {
      return [{ id: data.id, name: data.name, image: data.image }];
    }
  };

  const handleSelect = (item: { id: number; name: string }) => {
    console.log('selected', item);
    onSelect(item.name);
  };

  return (
    <div className="form-group">
      <label htmlFor="pokemonSearch" className="form-label">Pokedex</label>
      <Combobox
        items={items}
        onSearch={handleSearch}
        onSelect={handleSelect}
      />
    </div>
  );
};
