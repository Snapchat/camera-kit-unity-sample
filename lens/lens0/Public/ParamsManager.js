//@input Component.Text key1Text;

// This will use FallbackData if global.launchParams has not been filled out 
var launchParams = global.launchParams;

/* Storage accessors */
var shotsOnInvader;

var storageKey = "shotsOnInvader"

/****************/
function getData() {
    if (launchParams) {
        if (launchParams.has(storageKey) ) {
            
            shotsOnInvader = launchParams.getString(storageKey);         
            return true;
        }
        
    return false;
    }
}

function populateFields() {
    
    script.key1Text.text = "Invader was shot " + shotsOnInvader + " times";
}

try {
    if(getData()) { 
        populateFields();
    } else {
        script.key1Text.text = "Failed to get launchParams";
    }    
} catch (ex) {
    script.key1Text.text = "Error " + ex + " " + ex.message;
}
