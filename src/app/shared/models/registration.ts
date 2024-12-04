export class Registration {
    constructor(
      public RowId: number,          
      public FirstName: string,      
      public LastName: string,       
      public CustomerType: string,   
      public Mobile: string,         
      public Email: string,          
      public AllowPromotion: boolean,
      public Password: string        
    ) { }
  }
  