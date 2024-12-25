import { Component } from '@angular/core';
import { SafeUrlPipe } from '../../shared/pipes/safe-url.pipe';

@Component({
  selector: 'app-declaration-print',
  standalone: true,
  imports: [SafeUrlPipe],
  templateUrl: './declaration-print.component.html',
  styleUrl: './declaration-print.component.scss'
})
export class DeclarationPrintComponent {
customsPDF: any;
constructor(){
  this.customsPDF = ""
}

}
