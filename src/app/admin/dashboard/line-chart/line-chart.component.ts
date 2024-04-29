import { Component, Input, OnInit } from '@angular/core';
@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent implements OnInit {
  @Input() activeLineCustomer;
  @Input() activeLineProject;
  public lineChartLabels = [];

  lineChartData = [
    {
      data: [],
      label: 'Customer',
      fill: true,
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)',
      tension: 0.3,
    },
    {
      data: [],
      label: 'Project',
      fill: true,
      backgroundColor: 'rgba(77,83,96,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)',
      tension: 0.3,
    }
  ];
  ngOnInit() {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June', 'July',
      'August', 'September', 'October', 'November', 'December'
    ];

    const customerData = [];
    const projectData = [];

    if (Array.isArray(this.activeLineCustomer)) {
      const customerCounts = monthNames.map(monthName => {
        const monthData = this.activeLineCustomer.find(item => item.month.toString() === (monthNames.indexOf(monthName) + 1).toString());
        return monthData ? parseInt(monthData.count, 10) : 0;
      });
      customerData.push(...customerCounts);
      this.lineChartData[0].data = customerData;
    }

    if (Array.isArray(this.activeLineProject)) {
      const projectCounts = monthNames.map(monthName => {
        const monthData = this.activeLineProject.find(item => item.month.toString() === (monthNames.indexOf(monthName) + 1).toString());
        return monthData ? parseInt(monthData.count, 10) : 0;
      });
      projectData.push(...projectCounts);
      this.lineChartData[1].data = projectData;
    }
    this.lineChartLabels = monthNames;
  }
}
