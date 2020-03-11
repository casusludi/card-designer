
export default `
<!doctype html>

<html lang="en">

<head>
    <meta charset="utf-8">

    <title>{{title}}</title>

    <style>
        body  
        { 
            margin: 0;
            overflow: hidden;
            user-select: none;
        }
        
        *{
            box-sizing: border-box;
        }

    </style>
    <link rel="stylesheet" href="{{templateCSSPath}}">
</head>
<body class="basic">
    <div class="card-list">
        {% for  card in cards %}
            <div class="card-box">{{ card | template(face) | safe }}</div>
        {% endfor %}
    </div>
</body>
</html>
`