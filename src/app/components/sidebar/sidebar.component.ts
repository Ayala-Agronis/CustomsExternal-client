import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // 👈 חובה להוסיף

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule], // 👈 הוספה כאן
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {

    constructor(private router: Router) { }

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

}
