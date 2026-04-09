import BuilderCanvas from './BuilderCanvas'
import BuilderLibrary from './BuilderLibrary'
import BuilderPreview from './BuilderPreview'
import BuilderPropertiesPanel from './BuilderPropertiesPanel'

function BuilderTab({
  uiTree,
  selectedSection,
  selectedSectionId,
  onSelectSection,
  onDeleteSection,
  onReorderSections,
  onAddComponent,
  onAddBelow,
  onUpdateSection,
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[0.9fr_1.2fr_0.9fr]">
      <BuilderLibrary onAdd={onAddComponent} />

      <div className="space-y-4">
        <BuilderCanvas
          uiTree={uiTree}
          selectedId={selectedSectionId}
          onSelect={onSelectSection}
          onDelete={onDeleteSection}
          onReorder={onReorderSections}
          onAddBelow={onAddBelow}
        />
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">Live Preview</p>
          <BuilderPreview uiTree={uiTree} />
        </div>
      </div>

      <BuilderPropertiesPanel
        selectedSection={selectedSection}
        onUpdate={onUpdateSection}
      />
    </div>
  )
}

export default BuilderTab
