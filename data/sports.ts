export interface Sport {
  id: string;
  name: string;
  icon: string;
  slug: string;

  pricePerHour: number;
  maxPlayers: number;

  color: string;
}

export const sports: Sport[] = [
  {
    id: "football",
    name: "Football",
    icon: "⚽",
    slug: "/football",
    pricePerHour: 1200,
    maxPlayers: 10,
    color: "#22C55E",
  },
  {
    id: "box-cricket",
    name: "Box Cricket",
    icon: "🏏",
    slug: "/box-cricket",
    pricePerHour: 1800,
    maxPlayers: 12,
    color: "#F97316",
  },
  {
    id: "badminton",
    name: "Badminton",
    icon: "🏸",
    slug: "/badminton",
    pricePerHour: 500,
    maxPlayers: 4,
    color: "#06B6D4",
  },
  {
    id: "basketball",
    name: "Basketball",
    icon: "🏀",
    slug: "/basketball",
    pricePerHour: 1500,
    maxPlayers: 10,
    color: "#EF4444",
  },
  {
    id: "rugby",
    name: "Rugby",
    icon: "🏉",
    slug: "/rugby",
    pricePerHour: 2000,
    maxPlayers: 15,
    color: "#A855F7",
  },
  {
    id: "baseball",
    name: "Baseball",
    icon: "⚾",
    slug: "/baseball",
    pricePerHour: 1600,
    maxPlayers: 9,
    color: "#EAB308",
  },
];