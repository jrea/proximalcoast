export type GameTheme = "sixDof" | "misuse" | "horror";

export interface GameProject {
  slug: string;
  title: string;
  category: string;
  status: string;
  description: string;
  tags: string[];
  theme: GameTheme;
  emptyUpdateTitle: string;
  emptyUpdateDescription: string;
}

export const gameProjects: GameProject[] = [
  {
    slug: "failsafe",
    title: "Failsafe",
    category: "6DOF Shooter",
    status: "Abandoned",
    description: "A six-degrees-of-freedom shooter prototype exploring movement, spatial combat, and control.",
    tags: ["6DOF", "Spatial combat"],
    theme: "sixDof",
    emptyUpdateTitle: "A record of Failsafe.",
    emptyUpdateDescription: "Development has stopped. This page preserves the project; there are no published project notes here.",
  },
  {
    slug: "foreseeable-misuse",
    title: "Foreseeable Misuse",
    category: "Top-down action",
    status: "Abandoned",
    description: "A top-down action prototype about turning ordinary industrial junk into unpredictable weapons, with consequences shaped by the parts you combine.",
    tags: ["Systemic weapons", "Industrial chaos"],
    theme: "misuse",
    emptyUpdateTitle: "A record of Foreseeable Misuse.",
    emptyUpdateDescription: "Development has stopped. This page preserves the project; there are no published project notes here.",
  },
  {
    slug: "horror-survival-craft",
    title: "Horror Survival Craft",
    category: "Survival prototype",
    status: "Abandoned",
    description: "An early horror-survival prototype exploring oxygen, base building, and expeditions.",
    tags: ["Survival", "Crafting"],
    theme: "horror",
    emptyUpdateTitle: "A record of Horror Survival Craft.",
    emptyUpdateDescription: "Development has stopped. This page preserves the project; there are no published project notes here.",
  },
];

export function getGameProject(slug: string) {
  return gameProjects.find((game) => game.slug === slug);
}
