PAGE_PROG.sectionController.registerSection({
  
  id: "releases",
  
  element: document.getElementById("sectionRelease"),
  
  template: [
    "{{#milestones}}",
      "<table>",  
    
        "<thead>",
          "<tr>",
            "<td>",
              "{{header}} <span class=\"version\">{{version}}</span>",
              "</br>",
              "<span class=\"subdesc\"> {{subHeaderT}} {{subHeaderB}} </span>",
              "</br>",
              "<p class=\"buttonLink\"> <a class=\"play\" href=\"{{link}}\" target=\"_blank\">Play It</a> </p>",
            "</td>",
            "<td> {{#img}} <img src=\"{{img}}\" /> {{/img}} </td>",
          "</tr>",
        "</thead>",
        
        "<tbody>",
          "<tr> <td colspan=\"2\"> {{> textBlock}} </td> </tr>",
          "<tr> <td colspan=\"2\"> <p class=\"changelogBox\">",
            "<span>Changelog:</span>",
            "<ul>",
              "{{> changeLog}}",
            "</ul>",
          "</p> </td> </tr>",
        "</tbody>",
        
      "</table>",
    "{{/milestones}}"
  ].join(""),
      
  partials:{
    textBlock: "{{#text}}<p>{{{.}}}</p>{{/text}}",
    changeLog: "{{#changelog}}<li class=\"changelog\">{{{.}}}</li>{{/changelog}}"
  }
});