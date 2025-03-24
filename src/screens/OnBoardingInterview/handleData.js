import { isEmpty } from 'lodash';

function handleDataSaved(obj, logic) {
  try {
    let field = obj.fields.find(f => f.id === logic.field);
    if (field) {
      if (logic.type === 'visible') {
        let set = new Set();
        logic.condition.condition.forEach(condition => {
          let conditonField = obj.fields.find(f => f.id === condition.field);
          if (conditonField && conditonField.value != null) {
            if (condition.type === '=') {
              let valueCheck = !isEmpty(condition.key)
                ? conditonField.value[condition.key]
                : conditonField.value;
              set.add(condition.value === valueCheck);
            }
            if (condition.type === 'visible') {
              set.add(condition.value === conditonField.visible);
            }
          }
        });
        let valid =
          logic.condition.operator === 'AND' ? !set.has(false) && set.size > 0 : set.has(true);
        if (valid) {
          field.visible = logic.value;
        }
      }
    }
  } catch (error) {}
}

export { handleDataSaved };
