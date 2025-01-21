import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../shared/services/user.service';
import { CommonModule } from '@angular/common';
import { MessageService, Message } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule,MessagesModule],
  providers: [MessageService],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit {
  isRegister: any = false;
  msg: Message[] = [];
  user: any;

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

    const isRegisterValue = localStorage.getItem("isRegister");
    this.isRegister = isRegisterValue === "true";
  }

  navigate(destination: string) {debugger
    if(destination == 'declaration-main'){
      localStorage.setItem("currentDecId",'')
    }
    this.router.navigateByUrl(destination)
  }

}
