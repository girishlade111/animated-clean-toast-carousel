"use client"
import { ToastProvider, useToast } from "./toast-context"
import { ToastContainer } from "./animated-toast"
import { Carousel } from "./carousel"
import { Flower, Cross, Sun, Moon, Cloud, Umbrella, Wind, Snowflake, Rainbow, Zap, Heart, Star } from "lucide-react"

const FlowersAndSaintsUI = () => {
  const { addToast } = useToast()

  const items = [
    {
      Icon: Flower,
      title: "Rose",
      description: "Symbol of love and passion",
      action: () => addToast("Roses symbolize love and passion", "flower"),
    },
    {
      Icon: Cross,
      title: "St. Francis",
      description: "Patron saint of animals and nature",
      action: () => addToast("St. Francis is known for his love of nature", "saint"),
    },
    {
      Icon: Sun,
      title: "Sunflower",
      description: "Symbol of adoration and loyalty",
      action: () => addToast("Sunflowers always face the sun", "flower"),
    },
    {
      Icon: Moon,
      title: "St. Clare",
      description: "Patron saint of television",
      action: () => addToast("St. Clare is the patron saint of television", "saint"),
    },
    {
      Icon: Cloud,
      title: "Lily",
      description: "Symbol of purity and refined beauty",
      action: () => addToast("Lilies represent purity and refined beauty", "flower"),
    },
    {
      Icon: Umbrella,
      title: "St. Patrick",
      description: "Patron saint of Ireland",
      action: () => addToast("St. Patrick is famous for banishing snakes from Ireland", "saint"),
    },
    {
      Icon: Wind,
      title: "Dandelion",
      description: "Symbol of wishes and dreams",
      action: () => addToast("Dandelions are known for granting wishes", "flower"),
    },
    {
      Icon: Snowflake,
      title: "St. Nicholas",
      description: "Patron saint of children",
      action: () => addToast("St. Nicholas is the inspiration for Santa Claus", "saint"),
    },
    {
      Icon: Rainbow,
      title: "Iris",
      description: "Symbol of hope and wisdom",
      action: () => addToast("Irises represent hope and wisdom", "flower"),
    },
    {
      Icon: Zap,
      title: "St. Barbara",
      description: "Patron saint against lightning",
      action: () => addToast("St. Barbara is invoked against lightning and fire", "saint"),
    },
    {
      Icon: Heart,
      title: "Forget-me-not",
      description: "Symbol of true love and memories",
      action: () => addToast("Forget-me-nots symbolize true love and memories", "flower"),
    },
    {
      Icon: Star,
      title: "St. Dominic",
      description: "Patron saint of astronomers",
      action: () => addToast("St. Dominic is often depicted with a star", "saint"),
    },
  ]

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 to-pink-100 p-8">
      <h1 className="text-4xl font-bold text-indigo-800 mb-8 font-figtree">Flowers & Saints Toast UI</h1>
      <Carousel items={items} />
      <ToastContainer />
    </div>
  )
}

export default function Demo() {
  return (
    <ToastProvider>
      <FlowersAndSaintsUI />
    </ToastProvider>
  )
}
