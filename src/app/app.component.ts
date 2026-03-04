import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Title } from '@angular/platform-browser';
import { filter, Subscription } from 'rxjs';
import { PrimeNGConfig } from 'primeng/api';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { MixpanelService } from './shared/services/mixpanel.service';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    ButtonModule,
    SidebarComponent   // ← הוסיפי את זה כאן!
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})


export class AppComponent implements OnInit {
  routerSubscription!: Subscription;

  constructor(private router: Router, private titleService: Title, private primengConfig: PrimeNGConfig, private mixpanel: MixpanelService) { }

  ngOnInit(): void {
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      let route = this.router.routerState.root;
      while (route.firstChild) {
        route = route.firstChild;
      }
      if (route.snapshot.data['title']) {
        this.titleService.setTitle(route.snapshot.data['title']);
      }

      // 🚨 הוספה פה:
      const currentUrl = this.router.url;

      this.mixpanel.track('Page View', { page: currentUrl });

      if (currentUrl.includes('/login')) {
        document.body.classList.add('login-page');
      } else {
        document.body.classList.remove('login-page');
      }
    });


    this.primengConfig.setTranslation({
      startsWith: "מתחיל עם",
      contains: "מכיל",
      notContains: "לא מכיל",
      endsWith: "מסתיים עם",
      equals: "שווה ל",
      notEquals: "שונה מ",
      matchAll: "התאם הכל",
      matchAny: "התאמה כלשהי",
      apply: "החל",
      clear: "איפוס",
      noFilter: "ללא סינון",
      lt: "פחות מ",
      lte: "פחות או שווה ל",
      gt: "גדול מ",
      gte: "גדול או שווה ל",
      is: "הוא",
      isNot: "אינו",
      before: "לפני",
      after: "אחרי",
      addRule: " ",
      removeRule: "הסר",
      dayNames: ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"],
      dayNamesShort: ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"],
      dayNamesMin: ["א", "ב", "ג", "ד", "ה", "ו", "ש"],
      monthNames: [
        "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
        "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"
      ],
      monthNamesShort: [
        "ינו'", "פבר'", "מרץ", "אפר'", "מאי", "יונ'",
        "יול'", "אוג'", "ספט'", "אוק'", "נוב'", "דצמ'"
      ],
      today: "היום",
      // clear: "נקה",
      dateFormat: "dd/mm/yy",
      firstDayOfWeek: 0
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  navigateToHomePage() {
    this.router.navigate(['home-page']);

  }
  isLoggedIn(): boolean {
    return !!localStorage.getItem('user') && localStorage.getItem('isRegister') === 'true';
  }

}