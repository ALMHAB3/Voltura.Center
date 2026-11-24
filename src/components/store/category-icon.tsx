import {
  Box,
  Cpu,
  Gpu,
  HardDrive,
  Headphones,
  Keyboard,
  Laptop,
  MemoryStick,
  Monitor,
  Mouse,
  Smartphone,
  Watch,
  type LucideProps,
} from "lucide-react";

const icons = {
  laptop: Laptop,
  smartphone: Smartphone,
  monitor: Monitor,
  cpu: Cpu,
  gpu: Gpu,
  memory: MemoryStick,
  storage: HardDrive,
  headphones: Headphones,
  mouse: Mouse,
  keyboard: Keyboard,
  watch: Watch,
  box: Box,
} as const;

export const categoryIconNames = Object.keys(icons) as (keyof typeof icons)[];

export function CategoryIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = icons[name as keyof typeof icons] ?? Box;
  return <Icon aria-hidden {...props} />;
}
