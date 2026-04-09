import { getSectionEditableFields } from '../../utils/uiTree'

function BuilderPropertiesPanel({ selectedSection, onUpdate }) {
  if (!selectedSection) {
    return (
      <aside className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Properties</p>
        <p className="mt-3 text-sm text-slate-600">Select a section to edit its content and style values.</p>
      </aside>
    )
  }

  const fields = getSectionEditableFields(selectedSection)

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Properties</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{selectedSection.type}</p>

      <div className="mt-3 space-y-3">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea
                value={selectedSection.props?.[field.key] || ''}
                onChange={(event) => onUpdate(field.key, event.target.value)}
                className="min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              />
            ) : (
              <input
                type="text"
                value={selectedSection.props?.[field.key] || ''}
                onChange={(event) => onUpdate(field.key, event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              />
            )}
          </div>
        ))}
      </div>
    </aside>
  )
}

export default BuilderPropertiesPanel
