#!/usr/bin/env bash
# Build a distributable ZIP using Python 3 standard library.
set -euo pipefail
cd "$(dirname "$0")/.."
python3 - <<'PYTHON'
from pathlib import Path
import json, zipfile
version = json.loads(Path('manifest.json').read_text())['version']
Path('dist').mkdir(exist_ok=True)
output = Path('dist') / f'tinta-{version}.zip'
with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as archive:
    archive.write('manifest.json')
    for directory in ('icons', 'src', 'LICENSES'):
        if not Path(directory).is_dir():
            raise RuntimeError(f'Missing required directory: {directory}')
        for path in sorted(Path(directory).rglob('*')):
            if path.is_file():
                archive.write(path, str(path))
print(f'{output} ({output.stat().st_size} bytes)')
PYTHON
