
import * as moment from 'moment';
export class Common {


  //Data Survey Status
  public static dataSurveyStatus: any = {
    p: 'Pending',
    s: 'Save',
    f: 'Submitted',
    r: 'Reviewed',
    a: 'Approved',
    ac:'Active'
  };
  
  public static config = {
    printMode: 'template-popup',
    popupProperties:
      'toolbar=yes,scrollbars=yes,resizable=no,top=0,left=0,fullscreen=no',
    pageTitle: 'Performance Grading Index',
    templateString: '<header></header>{{printBody}}<footer></footer>',
    stylesheets: [
      {
        rel: 'stylesheet',
        href: 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css',
      },
    ],
    styles: [
      'table { border: 1px solid black; }',
      'header, table, footer { margin: auto; text-align: center;}',
      '.header-height {height:90px; width:100%;}',
      'a {color:black;text-decoration:none;}',
      'td {vertical-align: center;}', '.bread-span {font-weight:500}',
      'tr {vertical-align: center;}',
      'html, body { height: auto; }',
      '.print+.print {page-break-before: always;}',
      '@media print { html, body {height: 99% !important;}'
    ],
  };

  public static scroll(e: any, id: string) {
    let section: any = document.getElementById(id);
    section.scrollIntoView();
  }
  public static timeout: number = 10000

  public static setFinanacialYear() {
    let myDate = new Date();
    let currentYear = moment(myDate).format('YY')
    var previousYear: moment.Moment = moment().subtract(1, "year");
    let LY = previousYear.format('YYYY');
    // console.log('LY', LY + '-' + currentYear);
    return LY + '-' + currentYear

  }


  public static printPage() {
    let printContents: any, popupWin;
    printContents = document.getElementById('agrrement-section')?.innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    if (popupWin) {
      popupWin.document.open();
      popupWin.document.write(`
				<html>
					<head>
						<title>Anil Pathuri</title>
            <style>

             .header-table{
              background-color: #61346B;
             }
             .row-table{
              padding:200pt;
             }

            </style>
            <body onload="window.print();window.close()">${printContents}</body>
          </head>
        </html>
      `)
      popupWin.document.close();
    }

  }
}
