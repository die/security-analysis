---
---
<html>
	<head>
		<link rel="stylesheet" href="{{ '/css/security-analysis.css' | relative_url }}">
		<script type="text/javascript" src="security-analysis.js"></script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js"></script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.32/moment-timezone-with-data.min.js"></script>
	</head>
    <body onload="load()">
        {% include security-analysis.html %}
    </body>
</html>