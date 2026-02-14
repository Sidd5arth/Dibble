let idCounter = 0

export function generateId(): string {
  idCounter += 1
  return `obj_${idCounter}_${Date.now()}`
}
