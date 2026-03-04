import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StepService } from '../../shared/services/step.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  showSubmenu = false;

  constructor(private router: Router, private stepService: StepService) { }

  restart() {
    localStorage.setItem('currentDecId', '');
    localStorage.setItem('CustomsStatus', '');
    localStorage.setItem("activeIndex", "0");
    localStorage.setItem("maxIndex", "0");
    this.router.navigate(['declaration-main/dec-form']);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  navigateToNewDeclaration(type: string) {
    localStorage.setItem('currentDecId', '');
    localStorage.setItem('CustomsStatus', '');
    localStorage.setItem('activeIndex', '0');
    localStorage.setItem('maxIndex', '0');
    this.stepService.updateMaxIndex(0);
    let path = '';

    switch (type) {
      case 'import':
        path = 'dec-form';
        break;
      case 'transshipment':
        path = 'dec-form-ts';
        localStorage.setItem('decType', "tr")
        break;
      case 'export':
        path = 'dec-form-export';
        break;
      default:
        path = 'dec-form-ts';
    }

    this.router.navigate([`declaration-main/${path}`], {
      queryParams: { type }
    });
  }

}
