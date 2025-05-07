"use client"
import { SportCard } from "./sport-card"

type Sport = {
  id: string
  name: string
}

type Category = {
  id: string
  title: string
  emoji: string
  color: string
  activeColor: string
  borderColor: string
  activeBorderColor: string
  textColor: string
  sports: Sport[]
}

interface SportCategoryProps {
  category: Category
  selectedSports: string[]
  onToggleSport: (sportId: string) => void
}

export function SportCategory({ category, selectedSports, onToggleSport }: SportCategoryProps) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className={`text-xl ${category.textColor}`}>{category.emoji}</div>
        <h2 className={`text-lg font-medium ${category.textColor}`}>{category.title}</h2>
        <div className={`h-px flex-grow ${category.borderColor} opacity-30`}></div>
      </div>
      <div className="grid grid-cols-5 gap-4">
        {category.sports.map((sport) => (
          <SportCard
            key={sport.id}
            sport={sport}
            isSelected={selectedSports.includes(sport.id)}
            onToggle={() => onToggleSport(sport.id)}
            category={category}
          />
        ))}
      </div>
    </div>
  )
}
