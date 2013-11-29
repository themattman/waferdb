# AWS


### Open up ports so you can access your AWS micro instance over the web

1) From your console at https://console.aws.amazon.com/ec2/v2/home
2) Click Instances on the left, then click on your instance and look at the field called "security groups" under the "description" tab
3) With that security group name in mind, now click on "Security Groups" on the left side. Click on the row with the security group name you just memorized.
4) Click on the "Inbound" tab.
5) Enter in 3000-10000 for the Port Range
6) Click "Add Rule". Click "Apply Rule Changes"
7) Back at the EC2 console, click on the instance and check the security group name. Click the link that says "view rules"
