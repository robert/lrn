// The twelve things that can change between two figures. Always shown in
// exactly this order, never shuffled or added to, so he learns them by heart.
export const ATTRIBUTES = [
  { key: "shape", label: "Shape", hint: "including number of sides" },
  { key: "count", label: "How many" },
  { key: "size", label: "Size" },
  { key: "shading", label: "Shading" },
  { key: "rotation", label: "Rotation" },
  { key: "flipped", label: "Flipped", hint: "mirror image" },
  { key: "position", label: "Position on screen" },
  { key: "layer", label: "In front or behind" },
  { key: "line", label: "Line style", hint: "solid, dotted, double" },
  { key: "touching", label: "Touching" },
  { key: "pointing", label: "Pointing at" },
  { key: "inside", label: "Inside or outside" },
];

export const ATTRIBUTE_KEYS = ATTRIBUTES.map(a => a.key);

export const labelFor = key => {
  const attr = ATTRIBUTES.find(a => a.key === key);
  if (!attr) throw new Error(`Unknown attribute ${key}`);
  return attr.label;
};
