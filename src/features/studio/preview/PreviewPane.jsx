import BuilderPreview from '../builder/BuilderPreview'

function PreviewPane({ uiTree }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Preview from uiTree</p>
      <BuilderPreview uiTree={uiTree} />
    </div>
  )
}

export default PreviewPane
