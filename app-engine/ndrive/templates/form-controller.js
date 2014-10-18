{% load ndrive %}
ndrive.controller("FormController", function ($scope) {
  $scope.form = {
    {% for field in form.visible_fields %}
    {{ field.name }}: 
      {% if field|isCheckbox %}
      {% if field.value %}true{% else %}false{% endif %}
      {% elif field|isPassword %}
      null
      {% else %}
      {% if field.value %}"{{ field.value }}"{% else %}null{% endif %}
      {% endif %}{% if not forloop.last %}, {% endif %}
    {% endfor %}
  };
});