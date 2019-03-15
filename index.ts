interface Coordinate {
  row: number
  column: number
}

interface ClickedCheckbox extends Coordinate {
  timestamp: number
}

const clickedCheckboxes: ClickedCheckbox[] = []

const CHECKBOX_SIZE = 12

const numRows = Math.floor(window.innerHeight / CHECKBOX_SIZE)
const numCols = Math.floor(window.innerWidth / CHECKBOX_SIZE)

const checkboxes: Array<Array<HTMLInputElement>> = []

const init = () => {
  const containerEl = document.querySelector('.container')

  for (let y = 0; y < numRows; y++) {
    const rowEl = document.createElement('div')
    const className = document.createAttribute('class')
    className.value = 'row'
    rowEl.setAttributeNode(className)
    const rowCheckboxes: Array<HTMLInputElement> = []

    for (let x = 0; x < numCols; x++) {
      const checkboxEl = document.createElement('input')

      const inputType = document.createAttribute('type')
      inputType.value = 'checkbox'
      checkboxEl.setAttributeNode(inputType)

      rowEl.appendChild(checkboxEl)
      rowCheckboxes.push(checkboxEl)
    }

    containerEl.appendChild(rowEl)
    checkboxes.push(rowCheckboxes)
  }

  containerEl.addEventListener("click", (e: MouseEvent) => {
    const row = Math.floor(e.clientY / CHECKBOX_SIZE)
    const column = Math.floor(e.clientX / CHECKBOX_SIZE)

    clickedCheckboxes.push({
      row,
      column,
      timestamp: Date.now(),
    })
  })

  window.requestAnimationFrame(step)
}

const WAVE_LIFESPAN = 2000 // ms
const TICK_LENGTH = 100 // ms

let begin = Date.now()

let checkedBoxesInPreviousFrame: { [row: number]: { [column: number]: true }} = {}
const step = () => {
  const checkedBoxesInThisFrame: { [row: number]: { [column: number]: true }} = {}

  for (let i = 0; i < clickedCheckboxes.length;) {
    const checkbox = clickedCheckboxes[i]
    const age = Date.now() - checkbox.timestamp
    if (age > WAVE_LIFESPAN) {
      clickedCheckboxes.splice(i, 1)
      continue
    }

    const ticksSinceBirth = Math.floor(age / TICK_LENGTH)

    const coordinates: Coordinate[] = []
    const left = checkbox.column - ticksSinceBirth
    const right = checkbox.column + ticksSinceBirth
    const top = checkbox.row - ticksSinceBirth
    const bottom = checkbox.row + ticksSinceBirth

    if (left >= 0) {
      coordinates.push({
        row: checkbox.row,
        column: left,
      })
    }

    if (right < numCols) {
      coordinates.push({
        row: checkbox.row,
        column: right,
      })
    }

    if (top >= 0) {
      coordinates.push({
        row: top,
        column: checkbox.column,
      })
    }

    if (bottom < numRows) {
      coordinates.push({
        row: bottom,
        column: checkbox.column,
      })
    }

    for (const coordinate of coordinates) {
      if (!checkedBoxesInThisFrame[coordinate.row]) {
        checkedBoxesInThisFrame[coordinate.row] = {}
      }

      checkedBoxesInThisFrame[coordinate.row][coordinate.column] = true

      const checkbox = checkboxes[coordinate.row][coordinate.column]
      checkbox.checked = true
    }

    i++
  }

  for (const row of Object.keys(checkedBoxesInPreviousFrame)) {
    for (const column of Object.keys(checkedBoxesInPreviousFrame[row])) {
      if (checkedBoxesInThisFrame[row] && checkedBoxesInThisFrame[row][column]) {
        continue
      }

      const checkbox = checkboxes[row][column]
      checkbox.checked = false
    }
  }

  checkedBoxesInPreviousFrame = checkedBoxesInThisFrame

  window.requestAnimationFrame(step)
}

init()
