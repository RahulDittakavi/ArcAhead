import {
  Activity,
  Anchor,
  ArrowRight,
  Bell,
  CalendarClock,
  Check,
  CheckCheck,
  Clapperboard,
  Clock,
  CloudFog,
  Compass,
  Dot,
  Eye,
  Flag,
  Flame,
  Heart,
  HeartHandshake,
  Image,
  Lock,
  Map,
  MapPin,
  MapPinned,
  Minus,
  Play,
  Plus,
  Sailboat,
  Scroll,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";

/* Curated icon registry — only the icons the app actually uses, imported by
   name so the bundler tree-shakes the rest of lucide. Keyed by the kebab-case
   names used throughout the screens (mirrors the prototype's data-lucide). */
const REGISTRY: Record<string, LucideIcon> = {
  activity: Activity,
  anchor: Anchor,
  "arrow-right": ArrowRight,
  bell: Bell,
  "calendar-clock": CalendarClock,
  check: Check,
  "check-check": CheckCheck,
  clapperboard: Clapperboard,
  clock: Clock,
  "cloud-fog": CloudFog,
  compass: Compass,
  dot: Dot,
  eye: Eye,
  flag: Flag,
  flame: Flame,
  heart: Heart,
  "heart-handshake": HeartHandshake,
  image: Image,
  lock: Lock,
  map: Map,
  "map-pin": MapPin,
  "map-pinned": MapPinned,
  minus: Minus,
  play: Play,
  plus: Plus,
  sailboat: Sailboat,
  scroll: Scroll,
  search: Search,
  settings: Settings,
  shield: Shield,
  "shield-check": ShieldCheck,
  sparkles: Sparkles,
  star: Star,
  users: Users,
};

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: CSSProperties;
  className?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 20, color, style, className, strokeWidth = 2 }: IconProps) {
  const Cmp = REGISTRY[name];
  if (!Cmp) {
    if (import.meta.env.DEV) console.warn(`Icon: unknown name "${name}" — add it to the registry.`);
    return null;
  }
  return (
    <span className={"ico " + (className ?? "")} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", color, ...style }}>
      <Cmp size={size} color={color} strokeWidth={strokeWidth} style={{ verticalAlign: "middle" }} />
    </span>
  );
}
