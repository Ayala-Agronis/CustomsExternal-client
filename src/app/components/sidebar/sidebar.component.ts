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
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  showSubmenu = false;

  constructor(
    private router: Router,
    private stepService: StepService,
  ) {}

  restart() {
    localStorage.setItem('currentDecId', '');
    localStorage.setItem('CustomsStatus', '');
    localStorage.setItem('activeIndex', '0');
    localStorage.setItem('maxIndex', '0');
    this.router.navigate(['declaration-main/dec-form']);
  }

  logout() {
    // localStorage.clear();
    this.clearStorageOnLogout();

    this.router.navigate(['/login']);
  }

  private clearStorageOnLogout(): void {
    const keysToKeep = [
      'customsCargoIDType',
      'customsChargingCountry',
      'customsCountryExport',
      'customsFacilityID',
      'customsUnpackingSite',
    ];

    const prefixesToKeep = ['chargingPorts_'];

    const savedValues: Record<string, string> = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (!key) continue;

      const shouldKeepByName = keysToKeep.includes(key);
      const shouldKeepByPrefix = prefixesToKeep.some((prefix) =>
        key.startsWith(prefix),
      );

      if (shouldKeepByName || shouldKeepByPrefix) {
        const value = localStorage.getItem(key);
        if (value !== null) {
          savedValues[key] = value;
        }
      }
    }

    localStorage.clear();

    for (const [key, value] of Object.entries(savedValues)) {
      localStorage.setItem(key, value);
    }
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
        localStorage.setItem('decType', 'tr');
        break;
      case 'export':
        path = 'dec-form-export';
        break;
      default:
        path = 'dec-form-ts';
    }

    this.router.navigate([`declaration-main/${path}`], {
      queryParams: { type },
    });
  }
}
