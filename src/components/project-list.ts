import { DragTarget } from '../models/drag-drop';
import { Project, Status } from '../models/project-model';
import { state } from '../state/project-state';
import { ProjectItem } from '../components/project-item';
import { Component } from '../components/base-component';

export class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  assignedProjects: Project[] = [];

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`);
    this.configure();
    this.renderContent();
  }

  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    listEl.innerHTML = '';
    for (const item of this.assignedProjects) {
      new ProjectItem(this.element.querySelector('ul')!.id, item);
    }
  }

  configure() {
    state.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter(
        (p) =>
          p.status ===
          (this.type === 'active' ? Status.Active : Status.Finished)
      );
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });

    this.element.addEventListener('dragover', this.dragOverHandler.bind(this));
    this.element.addEventListener('drop', this.dropHandler.bind(this));
    this.element.addEventListener(
      'dragleave',
      this.dragLeaveHandler.bind(this)
    );
  }

  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent =
      this.type.toUpperCase() + ' projects';
  }

  dragOverHandler(event: DragEvent): void {
    if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
      event.preventDefault();
      const listEl = this.element.querySelector('ul')!;
      listEl.classList.add('droppable');
    }
  }
  dropHandler(event: DragEvent): void {
    const projectId = event.dataTransfer?.getData('text/plain')!;
    state.moveProject(
      projectId,
      this.type === 'active' ? Status.Active : Status.Finished
    );
  }
  dragLeaveHandler(_: DragEvent): void {
    const listEl = this.element.querySelector('ul')!;
    listEl.classList.remove('droppable');
  }
}
