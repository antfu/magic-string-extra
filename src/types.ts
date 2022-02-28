export interface SourceMapOptions {
  /**
   * Whether the mapping should be high-resolution.
   * Hi-res mappings map every single character, meaning (for example) your devtools will always
   * be able to pinpoint the exact location of function calls and so on.
   * With lo-res mappings, devtools may only be able to identify the correct
   * line - but they're quicker to generate and less bulky.
   * If sourcemap locations have been specified with s.addSourceMapLocation(), they will be used here.
   */
  hires: boolean
  /**
   * The filename where you plan to write the sourcemap.
   */
  file: string
  /**
   * The filename of the file containing the original source.
   */
  source: string
  /**
   * Whether to include the original content in the map's sourcesContent array.
   */
  includeContent: boolean
}
