import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Title } from '@angular/platform-browser';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, ButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent implements OnInit {

  constructor(private router: Router, private titleService: Title) { }

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      let route = this.router.routerState.root;
      while (route.firstChild) {
        route = route.firstChild;
      }
      if (route.snapshot.data['title']) {
        this.titleService.setTitle(route.snapshot.data['title']);
      }
    });
  }
}