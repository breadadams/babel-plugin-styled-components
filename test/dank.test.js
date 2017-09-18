import parser from '../src/dank/parser'

const parse = (input, expected) => {
  expect(parser(input)).toEqual(expected)
}

describe('dank parser', () => {
  it('should pass through unmatched tokens exactly', () => {
    parse(`
      foo: bar;
      &:hover {
        color: black;
        + * { margin: 2rem; }
      }
    `, `
      foo: bar;
      &:hover {
        color: black;
        + * { margin: 2rem; }
      }
    `)
  })

  it('should replace a simple interpolation', () => {
    parse(`
      $bar;
    `, `
      \${ bar };
    `)
    parse(`
      foo: $bar;
    `, `
      foo: \${bar};
    `)
    parse(`
      foo: $bar.baz;
    `, `
      foo: \${bar.baz};
    `)
  })

  it('should reject more complex JS expressions', () => {
    parse(`
      foo: $bar.baz();
    `, `
      foo: $bar.baz();
    `)
    parse(`
      foo: $bar.baz($omg, $ffs);
    `, `
      foo: $bar.baz($omg, $ffs);
    `)
  })

  it('should allow props and theme interpolations', () => {
    parse(`
      foo: $props.x;
      bar: $theme.y;
    `, `
      foo: \${props => props.x};
      bar: \${props => props.theme.y};
    `)
  })

  it('should allow fallbacks', () => {
    parse(`
      foo: $x || 0.5;
      bar: $props.y || lol;
      baz: $theme.z || 'x y z';
    `, `
      foo: \${x || '0.5'};
      bar: \${props => props.y || 'lol'};
      baz: \${props => props.theme.z || 'x y z'};
    `)
  })

  it('should allow ternary', () => {
    parse(`
      foo: $x ? 0.5 : 1.0;
      bar: $props.y ? lol : boats;
      baz: $theme.z ? 'x y z' : 'a b c';
    `, `
      foo: \${x ? '0.5' : '1.0'};
      bar: \${props => props.y ? 'lol' : 'boats'};
      baz: \${props => props.theme.z ? 'x y z' : 'a b c'};
    `)
  })

  it('should strip all $s', () => {
    parse(`
      foo: $x ? $y : $z;
      bar: $props.x ? $props.y : $props.z;
    `, `
      foo: \${x ? y : z};
      bar: \${props => props.x ? props.y : props.z};
    `)
  })

  it('should replace within a line', () => {
    parse(`
      animation: $name 0.3s linear infinite;
      transition: $props.name || backup 0.3s linear infinite;
    `, `
      animation: \${name} 0.3s linear infinite;
      transition: \${props => props.name || 'backup'} 0.3s linear infinite;
    `)
  })

  it('should allow optional blocks', () => {
    parse(`
      color: red;
      $props.primary? {
        color: blue;
        something: else;
      }
    `, `
      color: red;
      \${props => props.primary && css\`
        color: blue;
        something: else;
      \`}
    `)
  })
})
