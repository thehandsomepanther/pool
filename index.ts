interface Point {
  x: number
  y: number
}

const bresenhamCircle = (origin: Point, radius: number): Point[] => {
  const points: Point[] = []

  let x = 0
  let y = radius
  let d = 3 - (2 * radius)

  points.push(
    {x: origin.x + x, y: origin.y + y},
    {x: origin.x + x, y: origin.y - y},
    {x: origin.x - x, y: origin.y - y},
    {x: origin.x - x, y: origin.y + y},
    {x: origin.x + y, y: origin.y + x},
    {x: origin.x + y, y: origin.y - x},
    {x: origin.x - y, y: origin.y - x},
    {x: origin.x - y, y: origin.y + x},
  )

  while (y >= x) {
    x++

    if (d > 0) {
      y--
      d = d + 4 * (x - y) + 10
    } else {
      d = d + 4 * x + 6
    }

    points.push(
      {x: origin.x + x, y: origin.y + y},
      {x: origin.x + x, y: origin.y - y},
      {x: origin.x - x, y: origin.y - y},
      {x: origin.x - x, y: origin.y + y},
      {x: origin.x + y, y: origin.y + x},
      {x: origin.x + y, y: origin.y - x},
      {x: origin.x - y, y: origin.y - x},
      {x: origin.x - y, y: origin.y + x},
    )
  }

  return points
}

interface ClickedCheckbox {
  timestamp: number
  origin: Point
  lifespan: number
}

const clickedCheckboxes: ClickedCheckbox[] = []

const CHECKBOX_SIZE = 14

let container = document.querySelector('.container')
let containerRect = container.getBoundingClientRect()

const numRows = Math.floor(containerRect.height / CHECKBOX_SIZE)
const numCols = Math.floor(containerRect.width / CHECKBOX_SIZE)

const checkboxes: Array<Array<HTMLInputElement>> = []

const init = () => {
  const containerEl = document.querySelector('.container')

  for (let row = 0; row < numRows; row++) {
    const rowEl = document.createElement('div')
    const className = document.createAttribute('class')
    className.value = 'row'
    rowEl.setAttributeNode(className)
    const rowCheckboxes: Array<HTMLInputElement> = []

    for (let col = 0; col < numCols; col++) {
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
    clickedCheckboxes.push({
      origin: {
        x: Math.floor((e.clientX - containerRect.left) / CHECKBOX_SIZE),
        y: Math.floor((e.clientY - containerRect.top) / CHECKBOX_SIZE),
      },
      timestamp: Date.now(),
      lifespan: Math.random() * 4500 + 500
    })
  })

  window.addEventListener('resize', () => {
    container = document.querySelector('.container')
    containerRect = container.getBoundingClientRect()
  })
}

const TICK_LENGTH = 250 // ms

let begin = Date.now()
let checkedBoxesInPreviousFrame: { [row: number]: { [column: number]: true }} = {}

init()

setInterval(() => {
  const checkedBoxesInThisFrame: { [row: number]: { [column: number]: true }} = {}

  for (let i = 0; i < clickedCheckboxes.length;) {
    const checkbox = clickedCheckboxes[i]
    const age = Date.now() - checkbox.timestamp
    if (age > checkbox.lifespan) {
      clickedCheckboxes.splice(i, 1)
      continue
    }

    const radius = Math.floor(age / TICK_LENGTH)
    let points: Point[] = []
    if (radius > 0) {
      points = bresenhamCircle(checkbox.origin, radius)
    } else {
      if (!checkedBoxesInThisFrame[checkbox.origin.y]) {
        checkedBoxesInThisFrame[checkbox.origin.y] = {}
      }
      checkedBoxesInThisFrame[checkbox.origin.y][checkbox.origin.x] = true
    }

    for (const p of points) {
      if (p.y < 0 || p.y >= numRows || p.x < 0 || p.x >= numCols) {
        continue
      }

      if (!checkedBoxesInThisFrame[p.y]) {
        checkedBoxesInThisFrame[p.y] = {}
      }

      checkedBoxesInThisFrame[p.y][p.x] = true

      const checkbox = checkboxes[p.y][p.x]
      if (checkbox) {
        checkbox.checked = true
      }
    }

    i++
  }

  for (const row of Object.keys(checkedBoxesInPreviousFrame)) {
    for (const column of Object.keys(checkedBoxesInPreviousFrame[row])) {
      if (checkedBoxesInThisFrame[row] && checkedBoxesInThisFrame[row][column]) {
        continue
      }

      const checkbox = checkboxes[row][column]
      if (checkbox) {
        checkbox.checked = false
      }
    }
  }

  checkedBoxesInPreviousFrame = checkedBoxesInThisFrame
}, TICK_LENGTH)
