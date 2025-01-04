import Card from '../../components/Card';

export default function DesignSystem() {
  const colorSwatches = [
    { name: 'Primary', class: 'bg-primary' },
    { name: 'Secondary', class: 'bg-secondary' },
    { name: 'Tertiary', class: 'bg-tertiary' },
  ];

  const textColors = [
    { name: 'Title', class: 'text-title' },
    { name: 'Subtitle', class: 'text-subtitle' },
    { name: 'Body', class: 'text-body' },
    { name: 'Label', class: 'text-label' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-thin mb-8">Design System</h1>

      <div className="space-y-8">
        {/* Colors */}
        <Card>
          <h2 className="text-xl font-thin mb-4">Colors</h2>
          <div className="grid grid-cols-3 gap-4">
            {colorSwatches.map((swatch) => (
              <div key={swatch.name} className="space-y-2">
                <div className={`${swatch.class} h-20 rounded-lg border border-tertiary`} />
                <p className="text-sm text-label">{swatch.name}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Typography */}
        <Card>
          <h2 className="text-xl font-thin mb-4">Typography</h2>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-thin text-title mb-2">Heading 1</h1>
              <p className="text-sm text-label">Font: Quicksand, 3xl, font-thin</p>
            </div>
            <div>
              <h2 className="text-2xl font-thin text-subtitle mb-2">Heading 2</h2>
              <p className="text-sm text-label">Font: Quicksand, 2xl, font-thin</p>
            </div>
            <div>
              <p className="text-body mb-2">
                Body text example. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <p className="text-sm text-label">Font: Quicksand, base, normal</p>
            </div>
            <div>
              <p className="text-label">Label text example</p>
              <p className="text-sm text-label mt-2">Font: Quicksand, base, text-label</p>
            </div>
          </div>
        </Card>

        {/* Text Colors */}
        <Card>
          <h2 className="text-xl font-thin mb-4">Text Colors</h2>
          <div className="grid grid-cols-2 gap-4">
            {textColors.map((color) => (
              <div key={color.name} className="space-y-2">
                <p className={`${color.class} text-lg`}>The quick brown fox</p>
                <p className="text-sm text-label">{color.name}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
