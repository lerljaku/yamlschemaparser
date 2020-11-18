var yaml_includes = undefined
var iObj = { id: 0};
var validators = undefined
var vId = 0
var namespace = ''
var inputId = 0

document.getElementById('inputfile').addEventListener('change', function() { 
              
    var fr = new FileReader(); 
    
    fr.onload = function(){ 
        docs = jsyaml.safeLoadAll(fr.result)
        validators = {}
        namespace = ''
        inputId = 0
        var yaml_data = docs[0]
        yaml_includes = docs[1]
        iObj.id = 0
        body = format_yaml(yaml_data)
        document.getElementById("generateGuiDiv").innerHTML = body
        document.getElementById("yamlTextArea").value = formatYaml()
    }
      
    fr.readAsText(this.files[0]);
})

function format_yaml(yaml_data){
    var body = `<ul name="${namespace}" id="ul_${iObj.id++}">`
    body += formatInnerHtml(yaml_data)
    body += "</ul>"
    return body
}

function formatInnerHtml(yaml_data){
    var html = ``    
    for (var key in yaml_data){
        html += `<li id="${iObj.id++}">`
        html += `<label id="${iObj.id++}">${key}</label>`

        var value = yaml_data[key]

        html += formatLiElement(key, value)

        html += "</li>"
    }
    return html
}

function formatLiElement(key, value){
    var html = ``
    var tempNs = namespace
    if (!key.startsWith('/'))
        namespace += `/`
    namespace += `${key}`

    if (typeof value === 'undefined')
    {
        value = yaml_includes[key]
    }
    if (typeof value === 'object')
    {
        html += format_yaml(value)
    }
    else
    {
        var validator = parseValidator(value)
        html += validator.appendRequired()
        html += validator.appendValue(namespace)
    }

    namespace = tempNs

    return html
}

function parseYaml(){
    textArea = document.getElementById("textarea_yaml")
    textArea.value = "yaml parsed"
}

function hideSection(checkbox) {
    var checked = checkbox.checked
    var ul = checkbox.parentElement.getElementsByTagName("ul")[0]
    ul.style.display = checked ? "block" : "none" 
}

function insertItem(ulId, validatorId){
    var ul = document.getElementById(`${ulId}`)
    var ulName = ul.getAttribute("name")
    var liId = `${iObj.id++}`
    var validator = validators[validatorId].validator
    var newLi = `<li id="${liId}">`
    newLi += `<button class="removeButotn" onclick="removeItem('${liId}')">X</button>`
    var tempNs = namespace
    namespace = `${ulName}/[${liId}]`
    newLi += validator.appendValue(namespace)
    namespace = tempNs 
    newLi += `</li>`
    ul.innerHTML += newLi
}

function insertMapItem(ulId, validatorId){
    var ul = document.getElementById(`${ulId}`)
    var ulName = ul.getAttribute("name")
    var liId = `${iObj.id++}`
    var validator = validators[validatorId].validators[0]
    inputId++
    var tempNs = namespace
    namespace = `${ulName}/$${inputId}`

    var newLi = `<li id="${liId}">`
    newLi += `<button class="removeButotn" onclick="removeItem('${liId}')">X</button>`
    newLi += `<input id="$${inputId}"></input>`
    newLi += validator.appendValue(namespace)
    newLi += `</li>`
    ul.innerHTML += newLi

    namespace = tempNs 
}

function removeItem(liId){
    document.getElementById(liId).remove()
}




// =========================================== SCHEMA PARSER ===========================================




class RequiredKeyword{
    matchAndCut(validator, value){

        var match = /^required\s*=\s*(?<required>[Ff]alse)/g.exec(value)
        if (match !== null)
        {
            var m = match[0]
            validator.required = false
            value = Eat(value, m)
        }
        return value
    }
}
class NoneKeyword{
    matchAndCut(validator, value){
        var match = /^none\s*=\s*(?<none>True|False)/g.exec(value)
        if (match !== null)
        {
            var m = match[0]
            validator.none = match.groups.none == "True"
            value = Eat(value, m)
        }
        return value
    }
}
class MinKeyword{
    matchAndCut(validator, value){
        var match = /^min\s*=\s*(?<min>\d+)/g.exec(value)
        if (match !== null)
        {
            var m = match[0]
            validator.min = parseInt(match.groups.min)
            value = Eat(value, m)
        }
        return value
    }
}
class MaxKeyword{
    matchAndCut(validator, value){
        var match = /^max\s*=\s*(?<max>\d+)/g.exec(value)
        if (match !== null)
        {
            var m = match[0]
            validator.max = parseInt(match.groups.max)
            value = Eat(value, m)
        }
        return value
    }
}
class ExcludeKeyword{
    matchAndCut(validator, value){ // TODO ESCAPING
        var match = /^exclude\s*=\s*'(?<exclude>[^']+)'/g.exec(value)
        if (match === null)
            match = /^exclude\s*=\s*"(?<exclude>[^"]+)"/g.exec(value)
        if (match !== null)
        {
            var m = match[0]
            validator.exclude = match.groups.exclude
            value = Eat(value, m)
        }
        return value
    }
}
class StringValueKeyword { // TODO ESCAPING
    matchAndCut(validator, value){ 
        var match = /^'(?<stringValue>[^']+)'/g.exec(value)
        if (match === null)
            match = /^"(?<stringValue>[^"]+)"/g.exec(value)
        if (match !== null)
        {
            var m = match[0]
            validator.stringValue = match.groups.stringValue
            value = Eat(value, m)
        }
        return value
    }
}
class NameKeyword { // TODO ESCAPING
    matchAndCut(validator, value){ 
        var match = /^name\s*=\s*\s'(?<name>[^']+)'/g.exec(value)
        if (match === null)
            match = /^name\s*=\s*"(?<name>[^"]+)"/g.exec(value)
        if (match !== null)
        {
            var m = match[0]
            validator.name = match.groups.name
            value = Eat(value, m)
        }
        return value
    }
}
class ValidatorKeyword{ 
    matchAndCut(validator, value){ 
        var parsedValidator = parseValidator(value)
        validator.validator = parsedValidator
        value = Eat(value, parsedValidator.getSource())
        return value
    }
}
class ValidatorsKeyword{ 
    matchAndCut(validator, value){
        var parsedValidator = null
        while ((parsedValidator = parseValidator(value)) != null)
        { 
            validator.validators.push(parsedValidator)
            value = Eat(value, parsedValidator.getSource())

            if (value.startsWith(","))
            {
                value = Eat(value, ",")
            }                        
            if (value.startsWith(")"))
            {
                value = Eat(value, ")")
                break
            }
        } 

        return value
    }
}

class KeyKeyword {
    matchAndCut(validator, value){ 
        var match = /^key\s*=\s*/g.exec(value)
        if (match !== null)
        {
            value = Eat(value, match[0])

            var parsedValidator = parseValidator(value)
            validator.key = parsedValidator
            value = Eat(value, parsedValidator.getSource())
        }
        return value
    }
}

class EnumValuesKeyword{ // TODO ESCAPING
    matchAndCut(validator, value){ 
        do {
            var match = /^'(?<enumValue>[^']+)'/g.exec(value)
            if (match === null)
                match = /^"(?<enumValue>[^"]+)"/g.exec(value)
            if (match !== null)
            {
                var m = match[0]
                validator.enumValues.push(match.groups.enumValue)
                value = Eat(value, m)
            }

            match = /^(?<enumValue>\d+)/g.exec(value)    
            if (match !== null)
            {
                var m = match[0]
                validator.enumValues.push(parseInt(match.groups.enumValue))
                value = Eat(value, m)
            }

            match = /^(?<enumValue>(True|False))/g.exec(value)
            if (match !== null)
            {
                var m = match[0]
                validator.enumValues.push(match.groups.enumValue)
                value = Eat(value, m)
            }

            if (match !== null){
                if (value.startsWith(","))
                    value = Eat(value, ",")
                else if (value.startsWith(")"))
                    break
            }
        } while(match !== null)
        return value
    }
}
// required=False 
class ValidatorBase {
    constructor(value) {
        this.source = value
        this.required = true
        this.id = vId++
        validators[this.id] = this
    }

    getSource(){
        return this.source
    }

    processKeywords(keywords){
        var val = this.source
        keywords = keywords.concat([new NoneKeyword(), new RequiredKeyword()])
        val = Eat(val, this.validatorName)
        val = Eat(val, '(')
        
        do {
            var matched = false
            for (var index in keywords){
                var keyword = keywords[index]
                var newVal = keyword.matchAndCut(this, val)
                if (newVal !== val)
                {
                    matched = true
                    val = newVal
                    if (val.startsWith(","))
                    {
                        val = Eat(val, ",")
                    }
                    if (val.startsWith(")"))
                    {
                        matched = false
                        break
                    }
                }
            }
        } while(matched);

        if (val.startsWith(")"))
            val = Eat(val, ")")

        this.source = this.source.substring(0, this.source.length - val.length)
    }

    appendRequired(){
        return this.required ?  `<label class="requiredField">*</label>` : ``
    }

    validate(value){
        return !this.required || !isEmptyOrSpaces(value)
    }
}

function Eat(value, token){
    if (!value.startsWith(token))
        throw new Error(`unexpected token: '${value}' - expecting ${token}`)
    return value.substring(token.length, value.length).trim()
}

function isEmptyOrSpaces(str){
    if (typeof str === "string")
    {
        return str === null || str === undefined || str.match(/^\s*$/) !== null;
    }   
    if (typeof str === "boolean")
    {
        return !str
    }
}

class StringValidator extends ValidatorBase{
    constructor(value){
        super(value)
        this.validatorName = "str"
        
        this.min = undefined
        this.max = undefined
        this.exclude = undefined 
        
        this.processKeywords([ new MinKeyword(), new MaxKeyword(), new ExcludeKeyword() ])
    }
    
    appendValue(key){
        validators
        return `<input name="${key}" type="text" onKeyUp="validateInput(this)" data-validatorid="${this.id}" id="${iObj.id++}"></input>`
    }

    validate(value){
        if (!super.validate(value))
        {
            return false
        }
        else if (isEmptyOrSpaces(value))
        {
            return true
        }

        if (this.min !== undefined && parseInt(value) < this.min){
            return false
        }

        if (this.max !== undefined && this.max < parseInt(value)){
            return false
        }
        
        return true
    }
}

class IntValidator extends ValidatorBase{
    constructor(value){
        super(value)
        this.validatorName = "int"
        this.min = undefined
        this.max = undefined
        
        this.processKeywords( [ new MinKeyword(), new MaxKeyword() ])
    }

    appendValue(key){
        return `<input name="${key}" onKeyUp="validateInput(this)" data-validatorid="${this.id}" type="number" id="${iObj.id++}"></input>`
    }

    validate(value){
        if (!super.validate(value))
        {
            return false
        }
        else if (isEmptyOrSpaces(value))
        {
            return true
        }

        if (this.min !== undefined && parseInt(value) < this.min){
            return false
        }

        if (this.max !== undefined && this.max < parseInt(value)){
            return false
        }
        
        return true
    }
}

class BoolValidator extends ValidatorBase{
    constructor(value){
        super(value)
        this.validatorName = "bool"
            
        this.processKeywords([ ])
    }

    appendValue(key){
        return `<input name="${key}" onKeyUp="validateInput(this)" data-validatorid="${this.id}" type="checkbox" id="${iObj.id++}"></input>`
    }
}

class IncludeValidator extends ValidatorBase{
    constructor(value){
        super(value)
        this.validatorName = "include"
        this.stringValue = undefined

        this.processKeywords([ new StringValueKeyword() ])
    }
    
    appendRequired(){
        return this.required ? `` : `<input class="hideCheckbox" type="checkbox" onclick="hideSection(this)" id="${iObj.id++}" checked></input>`
    }

    appendValue(key){
        var tempNs = namespace
        namespace = ``
        var html = formatLiElement(key, yaml_includes[this.stringValue])
        namespace = tempNs
        return html
    }
}

class EnumValidator extends ValidatorBase{
    constructor(value){
        super(value)
        this.validatorName = "enum"
        this.enumValues = []

        this.processKeywords([ new EnumValuesKeyword() ])
    }

    appendValue(key){
        var html = `<select  data-validatorid="${this.id}" onchange="validateInput(this)" name="${key}" id="${iObj.id++}">`
        html += `<option selected value>-- select an option --</option>`

        for (var index in this.enumValues)
        {
            var enumValue = this.enumValues[index]

            html += `<option value="${enumValue}">${enumValue}</option>`
        }

        html += `</select>`
        return html
    }

    validate(value){
        if (!super.validate(value))
        {
            return false
        }
        else if (isEmptyOrSpaces(value))
        {
            return true
        }

        return true
    }
}

class RegexValidator extends ValidatorBase{
    constructor(value){
        super(value)
        this.validatorName = "regex"
        this.name = undefined
        this.stringValue = undefined

        this.processKeywords([ new StringValueKeyword(), new NameKeyword() ])
    }

    appendValue(key){
        return `<input name="${key}" data-validatorid="${this.id}" onKeyUp="validateInput(this)" type="text" id="${iObj.id++}"></input>`
    }

    validate(value){
        if (!super.validate(value))
        {
            return false
        }
        else if (isEmptyOrSpaces(value))
        {
            return true
        }

        var regex = new RegExp(this.stringValue)
        if (value.match(regex) === null){
            return false
        }

        return true
    }
}

class ListValidator extends ValidatorBase{
    constructor(value){
        super(value)
        this.validatorName = "list"
        this.name = undefined
        this.validator = undefined

        this.processKeywords([ new ValidatorKeyword(), new MinKeyword(), new MaxKeyword() ])
    }
    
    appendValue(key){
        var id = iObj.id++
        var ulId = `ul_${id}`
        var html = `<button class="addButton" onclick="insertItem('${ulId}', '${this.id}')" id="${id}">+</button>`
        html += `<ul name="${key}" id="${ulId}"></ul>`
        return html        
    }
}

class AnyValidator extends ValidatorBase{
    constructor(value){
        super(value)
        this.validatorName = "any"
        this.name = undefined
        this.validators = []

        this.processKeywords([ new ValidatorsKeyword() ])
    }

    appendValue(key){
        var html = `<select data-validatorid="${this.id}" onchange="showSubsection(this)" id="${iObj.id++}">`
        var hiddenHtml = `<ul name="${key}">`
        html += `<option selected value>-- select an option --</option>`
        for (var index in this.validators){
            var validator = this.validators[index]
            html += `<option data-validatorid="${validator.id}">${validator.getSource()}</option>`
            hiddenHtml += `<div style="display: none;" data-validatorid="${validator.id}">${validator.appendValue(key)}</div>`
        }  
        html += `</select>`
        html += hiddenHtml + `</ul>`
        return html
    }
}

function showSubsection(select){
    validateInput(select)
        
    var index = select.selectedIndex
    var option = select.options[index]
    var validatorId = option.getAttribute("data-validatorid")
    var parent = select.parentElement
    var divs = [...parent.getElementsByTagName(`div`)]

    for (var divIndex in divs)
    {
        var div = divs[divIndex]
        var divValidatorId = div.getAttribute("data-validatorid")
        var checked = divValidatorId == validatorId
        div.style.display = checked ? "block" : "none" 
    }    
}

class MapValidator extends ValidatorBase{
    constructor(value){
        super(value)
        this.validatorName = "map"
        this.name = undefined
        this.key = new StringValidator("str()")
        this.validators = []

        this.processKeywords([ new ValidatorsKeyword(), new KeyKeyword() ])
    }

    appendValue(key){
        var id = iObj.id++
        var ulId = `ul_${id}`
        var html = `<button class="addButton" onclick="insertMapItem('${ulId}', '${this.id}')" id="${id}">+</button>`
        html += `<ul name="${key}" id="${ulId}"></ul>`
        return html      
    }
}

function parseValidator(value){
    if(value.startsWith('regex')){
        return new RegexValidator(value)
    }
    else if(value.startsWith('include')){
        return new IncludeValidator(value)          
    }
    else if(value.startsWith('list')){
        return new ListValidator(value)   
    }
    else if(value.startsWith('bool')){
        return new BoolValidator(value)           
    }
    else if(value.startsWith('enum')){
        return new EnumValidator(value)         
    }
    else if(value.startsWith('int')){
        return new IntValidator(value)      
    }
    else if(value.startsWith('str')){
        return new StringValidator(value)
    }
    else if(value.startsWith('any')){
        return new AnyValidator(value)
    }
    else if(value.startsWith('map')){
        return new MapValidator(value)      
    }
    else {
        return null
    }
}

function validateInput(input){
    var value = input.value
    var validatorId = input.getAttribute("data-validatorid")
    var validator = validators[validatorId]
    var isValid = validator.validate(value)
    if (isValid){
        input.style.borderColor = "green"
    }
    else{
        input.style.borderColor = "red"
    }
}
