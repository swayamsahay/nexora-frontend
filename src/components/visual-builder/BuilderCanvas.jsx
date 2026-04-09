import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { sectionTitle } from '../../utils/uiTree'

function SortableSectionItem({ section, index, isSelected, onSelect, onDelete, onAddBelow }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  }

  return (
    <div className="group space-y-2" ref={setNodeRef} style={style}>
      <button
        type="button"
        onClick={() => onSelect(section.id)}
        className={`w-full rounded-xl border px-4 py-3 text-left transition ${isSelected ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-75">{section.type}</p>
            <p className="mt-1 text-sm font-semibold">{sectionTitle(section)}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onDelete(section.id)
              }}
              className={`rounded-lg px-2 py-1 text-xs font-semibold ${isSelected ? 'bg-white/15 text-white' : 'bg-rose-50 text-rose-700'} opacity-0 transition group-hover:opacity-100`}
            >
              Delete
            </button>
            <span
              className={`cursor-grab rounded-lg px-2 py-1 text-xs font-semibold ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}
              {...attributes}
              {...listeners}
            >
              Drag
            </span>
          </div>
        </div>
      </button>

      <button
        type="button"
        className="w-full rounded-lg border border-dashed border-slate-300 px-3 py-1 text-xs font-medium text-slate-500 opacity-0 transition group-hover:opacity-100"
        onClick={() => onAddBelow(index + 1)}
      >
        + Add section below
      </button>
    </div>
  )
}

function BuilderCanvas({ uiTree, selectedId, onSelect, onDelete, onReorder, onAddBelow }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  if (!Array.isArray(uiTree) || uiTree.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-600">
        Canvas is empty. Add sections from the component library.
      </section>
    )
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = uiTree.findIndex((item) => item.id === active.id)
    const newIndex = uiTree.findIndex((item) => item.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    onReorder(arrayMove(uiTree, oldIndex, newIndex))
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Visual Canvas</p>
      <div className="mt-3 space-y-3">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={uiTree.map((section) => section.id)} strategy={verticalListSortingStrategy}>
            {uiTree.map((section, index) => (
              <SortableSectionItem
                key={section.id}
                section={section}
                index={index}
                isSelected={selectedId === section.id}
                onSelect={onSelect}
                onDelete={onDelete}
                onAddBelow={onAddBelow}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </section>
  )
}

export default BuilderCanvas
