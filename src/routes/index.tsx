import { createFileRoute, Link } from '@tanstack/react-router'
import {
  MousePointer2,
  Square,
  Circle,
  Type,
  Pen,
  Layers,
  Settings2,
  Undo2,
  Redo2,
} from 'lucide-react'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  const features = [
    {
      icon: <MousePointer2 className="w-10 h-10" />,
      bg: 'bg-[var(--brutal-cyan)]',
      title: 'Select & Move',
      description:
        'Click to select objects, drag to reposition, and resize with handles. Multi-select coming soon.',
    },
    {
      icon: <Square className="w-10 h-10" />,
      bg: 'bg-[var(--brutal-pink)]',
      title: 'Shapes',
      description:
        'Draw rectangles and ellipses. Pick any fill color and customize dimensions.',
    },
    {
      icon: <Type className="w-10 h-10" />,
      bg: 'bg-[var(--brutal-green)]',
      title: 'Text',
      description:
        'Add text layers with adjustable font size and styling. Double-click to edit inline.',
    },
    {
      icon: <Pen className="w-10 h-10" />,
      bg: 'bg-[var(--brutal-purple)]',
      title: 'Freehand Pen',
      description:
        'Draw custom paths with the pen tool. Create curves with bezier handles for precise control.',
    },
    {
      icon: <Layers className="w-10 h-10" />,
      bg: 'bg-[var(--brutal-yellow)]',
      title: 'Layers Panel',
      description:
        'Manage all objects in a layer list. Drag to reorder, rename layers, and keep your design organized.',
    },
    {
      icon: <Settings2 className="w-10 h-10" />,
      bg: 'bg-[var(--brutal-cyan)]',
      title: 'Properties',
      description:
        'Edit position, size, rotation, and fill color. For text: change content and font size.',
    },
    {
      icon: (
        <span className="flex gap-1">
          <Undo2 className="w-10 h-10" />
          <Redo2 className="w-10 h-10" />
        </span>
      ),
      bg: 'bg-[var(--brutal-pink)]',
      title: 'Undo & Redo',
      description:
        'Full history support. Use Ctrl+Z and Ctrl+Shift+Z or the toolbar buttons.',
    },
  ]

  return (
    <div className="min-h-screen bg-[var(--brutal-white)]">
      <section className="py-16 px-6 text-center border-b-[3px] border-[var(--brutal-black)] bg-[var(--brutal-yellow)]">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-[var(--brutal-black)] flex items-center justify-center border-[3px] border-[var(--brutal-black)] shadow-[6px_6px_0_var(--brutal-black)]">
              <span className="text-3xl md:text-4xl font-black text-[var(--brutal-yellow)]">
                D
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-[var(--brutal-black)] [letter-spacing:-0.04em]">
              DIBBLE
            </h1>
          </div>
          <p className="text-lg md:text-xl text-[var(--brutal-black)] mb-2 font-bold">
            Canva-style design editor
          </p>
          <p className="text-base text-[var(--brutal-black)]/80 max-w-2xl mx-auto mb-8 font-medium">
            Create designs with shapes, text, and freehand drawing. Pan and zoom
            the canvas. Ctrl+plus/minus to zoom, or scroll to pan.
          </p>
          <Link
            to="/editor"
            className="inline-block px-8 py-4 bg-[var(--brutal-black)] text-[var(--brutal-yellow)] font-bold border-[3px] border-[var(--brutal-black)] shadow-[6px_6px_0_var(--brutal-black)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_var(--brutal-black)] transition-all"
          >
            OPEN EDITOR
          </Link>
        </div>
      </section>

      <section className="py-12 px-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-black text-[var(--brutal-black)] mb-8 text-center">
          EDITOR FEATURES
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`${feature.bg} border-[3px] border-[var(--brutal-black)] p-5 shadow-[4px_4px_0_var(--brutal-black)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_var(--brutal-black)] transition-all`}
            >
              <div className="mb-3 text-[var(--brutal-black)]">{feature.icon}</div>
              <h3 className="text-lg font-bold text-[var(--brutal-black)] mb-2">
                {feature.title}
              </h3>
              <p className="text-[var(--brutal-black)]/90 text-sm leading-relaxed font-medium">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
