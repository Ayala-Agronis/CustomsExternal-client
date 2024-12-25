import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit {

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
            alert('hi' + res.body.FirstName)
          })
        })
    });
  }

  navigate(destination: string) {
    this.router.navigateByUrl(destination)
  }

}
