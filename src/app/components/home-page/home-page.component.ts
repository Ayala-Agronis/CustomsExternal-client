import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../shared/services/user.service';
import { CommonModule } from '@angular/common';
import { MessageService, Message, MenuItem } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, MessagesModule, MenuModule, MenubarModule],
  providers: [MessageService],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit {
  isRegister: any = false;
  msg: Message[] = [];
  user: any;
  menuItems: MenuItem[] = [];
  isClientAuthorized = true

  constructor(private router: Router, private route: ActivatedRoute, private userService: UserService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      console.log(code);

      if (code)
        this.userService.getDetails(code).subscribe(res => {
          console.log(res);
          this.userService.loginByGoogle(res).subscribe((res: any) => {
            console.log(res)
            console.log(res.body)
            this.msg = [
              { severity: 'success', summary: '', detail: 'hi' + res.body.FirstName },
            ];
          })
        })
    });

    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
    }
    
    this.isClientAuthorized = localStorage.getItem('isClientAuthorized') === 'true' || true;

    const isRegisterValue = localStorage.getItem("isRegister");
    this.isRegister = isRegisterValue === "true";
    this.menuItems = [
      {
        label: 'מי אנחנו',
        icon: 'pi pi-info-circle',
        command: () => this.navigate('about-us'),
        // iconClass:'menu-item-spacing',
        // styleClass :'menu-item-spacing'
      },
      {
        label: 'שירות לעסקים',
        icon: 'pi pi-briefcase',
        command: () => this.navigate('business-service'),

      },
      {
        label: 'שירות ומחירים',
        icon: 'pi pi-dollar',
        command: () => this.navigate('pricing'),
      },
      {
        label: 'דברו איתנו',
        icon: 'pi pi-comments',
        command: () => this.navigate('contact')
      },
      ...(this.isRegister ? [
        {
          label: 'משתמש ',
          icon: 'pi pi-user',
          items: [
            {
              label: 'פרטים אישיים',
              icon: 'pi pi-user',
              command: () => this.router.navigate(['personal-details'], { queryParams: { personalDetails: true } })
            },
            {
              label: 'התנתקות',
              icon: 'pi pi-sign-out',
              command: () => this.logout()
            }
          ]
        }] : []),
    ];
  }

  navigate(destination: string) {
    if (destination == 'declaration-main') {
      localStorage.setItem("currentDecId", '')
      localStorage.setItem("maxIndex", '0')
    }
    this.router.navigateByUrl(destination)
  }

  logout() {
    this.isRegister = false
    localStorage.setItem("isRegister", "false")
  }

}
