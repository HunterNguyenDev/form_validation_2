function Validator(formSelector) {

    //Gán giá trị mặc đinh cho tham số(ES5)
    var _this = this;
    var formRules = {};

    function getParent(element, selector) {
        while (element.parentElement) {
          if(element.parentElement.matches(selector)) {
            return element.parentElement;
          }
          element = element.parentElement;
        }
    }

    //Nguyên tắc của các Rules:
    //1. Khi có lỗi => Trả ra message LỖI
    //2. Khi hơp lệ => Không tră gì cả (underfined)
    var validatorRules = {
        required: function(value){
            return value ? undefined : 'Vui lòng nhập trường này';
        },
        email: function(value){
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Vui lòng nhập email';
        },
        min: function(min){
            return function(value){
                value.length >= min ? undefined : `Vui lòng nhập ít nhất ${min} kí tự`;
            }
        },
        max: function(max){
            return function(value){
                value.length <= max ? undefined : `Vui lòng nhập tối đa ${max} kí tự`;
            }
        },
    };
    // var ruleName ='required';
    // console.log(validatorRules[ruleName])


    //Lấy ra Form element trong DOM theo `formSelector`
    var formElement = document.querySelector(formSelector);

    //Chỉ xử lý khi có element trong DOM 
    if(formElement) {
        var inputs =formElement.querySelectorAll('[name][rules]')
        for(var input of inputs) {

            var rules = input.getAttribute('rules').split('|')
            for(var rule of rules) {

                var ruleInfo;
                var isRuleHasValue = rule.includes(':');

                if(isRuleHasValue) {
                    ruleInfo = rule.split(':');
                    // console.log(ruleInfo)
                    rule = ruleInfo[0];
                }

                var ruleFunc = validatorRules[rule];

                if(isRuleHasValue) {
                    ruleFunc = ruleFunc(ruleInfo[1]);
                }

                if(Array.isArray(formRules[input.name])){
                    formRules[input.name].push(ruleFunc);
                    
                }else {
                    formRules[input.name] = [ruleFunc];
                }
            }

            //Lắng nghe sự kiện để Validate(blur, change...)
            input.onblur = handleValidate;
            input.oninput = handleClearError;
        }
        
        function handleValidate(event) {
            var rules = formRules[event.target.name];
            var errorMessage;

            for (var rule of rules) {
                errorMessage = rule(event.target.value);
                if(errorMessage) break;
            }
            
            //Nếu có lỗi thì hển thị mesage lỗi ra UI 
            if(errorMessage) {
                var formGroup = getParent(event.target, '.form-group');
                if(formGroup) {
                    formGroup.classList.add("invalid");

                    var formMessage = formGroup.querySelector('.form-message');
                    if(formMessage) {
                        formMessage.innerText = errorMessage;
                    }
                }
                // console.log(formGroup);
            }

            return !errorMessage;
        }

        //Hàm clear Message
        function handleClearError(event) {
            var formGroup = getParent(event.target, '.form-group');
            if(formGroup.classList.contains('invalid')){
                formGroup.classList.remove('invalid');
                var formMessage = formGroup.querySelector('.form-message');

                if(formMessage) {
                    formMessage.innerText = '';
                }
            }

        }
        // console.log(formRules)
    }


    //Xử lý hành vi SUBMIT form 
    formElement.onsubmit = function(event) {
        event.preventDefault();



        var inputs =formElement.querySelectorAll('[name][rules]')
        var isValid = true;

        for(var input of inputs) {

            if (!handleValidate({target: input})) {
                isValid = false;
            }
        }

        //Khi không có lỗi thì SUBMIT form
        if(isValid) {
            if(typeof _this.onSubmit ==='function') {
                var enableInputs = formElement.querySelectorAll('[name]');

                var formValues = Array.from(enableInputs).reduce(function (values, input) {

                    switch(input.type){
                    case 'radio':
                        values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;  
                    case 'checkbox':
                        if(!input.matches(':checked')) {
                            values[input.name] = '';
                            return values
                        };
                        if(!Array.isArray(values[input.name])) {
                            values[input.name] = [];
                        }
                        values[input.name].push(input.value)
                        break;
                        case 'file':
                    values[input.name] = input.files;
                    break;
                    default:
                    values[input.name] = input.value;
                    }
                    return values;
                }, {});

                //Gọi lại hàm ónubmit và trả về kèm giá trị của form 
                return _this.onSubmit(formValues);
            }
            else {
                formElement.submit();

            }
        }
    }
}