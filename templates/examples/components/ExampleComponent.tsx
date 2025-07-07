// Example component demonstrating preferred coding patterns
// Replace this with your own component style

import { memo, useCallback, useMemo } from 'react';

interface Props {
  readonly title: string;
  readonly items: readonly string[];
  readonly onItemClick?: (item: string) => void;
}

export const ExampleComponent = memo(({ title, items, onItemClick }: Props) => {
  const handleItemClick = useCallback((item: string) => {
    if (onItemClick)
      onItemClick(item);
  }, [onItemClick]);

  const sortedItems = useMemo(() => {
    return [...items].sort();
  }, [items]);

  if (!items.length)
    return <div>No items</div>;

  return (
    <div className="example-component">
      <h2>{title}</h2>
      <ul>
        {sortedItems.map((item) => (
          <li key={item}>
            <button onClick={() => handleItemClick(item)}>
              {item}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
});