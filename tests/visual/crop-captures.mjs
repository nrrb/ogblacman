import fs from 'node:fs/promises'
import path from 'node:path'
import { PNG } from 'pngjs'

const widths = { '1440x900': 1440, '1280x800': 1280, '768x1024': 768, '390x844': 390 }

for (const directory of ['reference', 'local']) {
  for (const [name, width] of Object.entries(widths)) {
    const source = PNG.sync.read(await fs.readFile(path.join('tests/visual', directory, `${name}.png`)))
    const output = new PNG({ width: Math.min(width, source.width), height: source.height })
    for (let y = 0; y < source.height; y += 1) {
      const sourceStart = y * source.width * 4
      const outputStart = y * output.width * 4
      source.data.copy(output.data, outputStart, sourceStart, sourceStart + output.width * 4)
    }
    await fs.writeFile(path.join('tests/visual', directory, `${name}-viewport.png`), PNG.sync.write(output))
  }
}
