
//globals document
var root = document.documentElement;

//Primal Globals
//pxRangeOfHBI is of the format [[XAxisMinVal, XAxisMaxVal], [YAxisMinVal, YAxisMaxVal]]
var pxRangeOfHBI = [[],[]];


//S1 Globals
var S1_CPT_X; var S1_CPT_Y;
var S1_Halos_Width; var S1_Halos_Height;
var currPos_S1 = [];
var realtimeTrackingAnimInstance_S1;
var globalS1AxisCoordsForMouseTracking;



//S2 Globals
var S2_CPT_X; var S2_CPT_Y;
var S2_Halos_Width; var S2_Halos_Height;
var globalS2AxisCoordsForMouseTracking;

//adding event listeners for main menu buttons
initializeActiveMenuButtons();
initializeClickListenersForMenuButtons();

//globals for button Hover/click related functionality
var mouseOnButtons;

function globalRestartListener(){
    spotlightPatrolLoop_bothSpotlights();
}


window.onload = main;

//main is to be called on page load and every time the browser window is resized
function main(){

   //  currPos_S1 = [];
    // currPos_S2 = [];

    initializeDimensionsOfHalos();

    updatePXRangeOfHBI();

    //insert reset spotlight here.
spotlightPatrolLoop_bothSpotlights();

   // setInterval(spotlightPatrolLoop_bothSpotlights, 5000);

  //  spotlightPatrolLoop_bothSpotlights();
    //console.log("krabs: " + window.getComputedStyle(document.getElementById("spotlight1NativeRadGradContainer")).background);

}

function spotlightPatrolLoop_bothSpotlights() {

    restartPatrol_BothSpotlights();

    //Dealing with S1
    let trajectory_S1 = createRandTrajectory();
    let startCoords_S1 = trajectory_S1[0];
    let destCoords_S1 = trajectory_S1[1];

    //For testing. delete after testing.
   //let startCoords_S1 = [610, 400];
   // let destCoords_S1 = [1200, 600];

    let sweepTime_S1 = generateRandSweepTime(startCoords_S1, destCoords_S1);
    let axisSourceCoords_S1 = getAxisSourceCoords("spotlight1EmitterMock");

    //TO DO : Write this functtion calcExtHalosOpaqueShellOffset that calculates (in px) how much screen space the black opaque part of the ExtHalos (the outer edge of the radial gradient) we should offset the ray coords by
    let extHalosOpaqueShellOffset_S1  = calcExtHalosOpaqueShellOffset("S1");
    //console.log("extHalosOpaqueShellOffset_S1: " + extHalosOpaqueShellOffset_S1);
    // let extHalosOpaqueShellOffset_S2 = calcExtHalosOpaqueShellOffset("S2");
    //   let extHalosOpaqueShellOffset_S1 = calcExtHalosOpaqueShellOffset_SpecifyRGInfo();
    // let extHalosOpaqueShellOffset_S2 = calcExtHalosOpaqueShellOffset_SpecifyRGInfo();

    //rough solution. I find that multiplying it by 3.9 generates an accurate displacement
    let extHalosOpaqueShellOffset = extHalosOpaqueShellOffset_S1 * 3.9;
   




    //checking the type of trajectory for S1
    if (checkTrajectoryModelType(startCoords_S1, destCoords_S1, axisSourceCoords_S1) == "TwoStage") {

        twoStageTrajectoryProgramLoop_S1(startCoords_S1, destCoords_S1, axisSourceCoords_S1, sweepTime_S1, extHalosOpaqueShellOffset);
    }

    else if (checkTrajectoryModelType(startCoords_S1, destCoords_S1, axisSourceCoords_S1) == "OneStage") {


        oneStageTrajectoryProgramLoop_S1(startCoords_S1, destCoords_S1, axisSourceCoords_S1, sweepTime_S1, extHalosOpaqueShellOffset);
    }



    //Now dealing with spotlight2
    let trajectory_S2 = createRandTrajectory();
    let startCoords_S2 = trajectory_S2[0];
    let destCoords_S2 = trajectory_S2[1];

    //For testing. Delete after testing
    //let startCoords_S2 = [820, 250];
    //let destCoords_S2 = [740, 600];

    let sweepTime_S2 = generateRandSweepTime(startCoords_S2, destCoords_S2);
    let axisSourceCoords_S2 = getAxisSourceCoords("spotlight2EmitterMock");

    let extHalosOpaqueShellOffset_S2 = calcExtHalosOpaqueShellOffset("S2");

    extHalosOpaqueShellOffset_S2 = extHalosOpaqueShellOffset_S2 * 3.9;

    if (checkTrajectoryModelType(startCoords_S2, destCoords_S2, axisSourceCoords_S2) == "TwoStage") {

        twoStageTrajectoryProgramLoop_S2(startCoords_S2, destCoords_S2, axisSourceCoords_S2, sweepTime_S2, extHalosOpaqueShellOffset_S2);

    }


    else if (checkTrajectoryModelType(startCoords_S2, destCoords_S2, axisSourceCoords_S2) == "OneStage") {
        oneStageTrajectoryProgramLoop_S2(startCoords_S2, destCoords_S2, axisSourceCoords_S2, sweepTime_S2, extHalosOpaqueShellOffset_S2);
    }


    //Safely Restart the loop after ending all animate tags
    
    
    //setTimeout(restartPatrol_BothSpotlights, 20000);



}

//Will retain the final positions of both the spotlights and restart their loops from that position
//Must pause and empty the classlists of all currently active anim tags
function restartPatrol_BothSpotlights(){

    //DEALING WITH S1

    //removing the pause class from the container
    //IMPROVED METHOD: JUST CLERAING THE ENTIRE CLASSLIST on all of the spotlight's elements to reset them so that the patrolLoop can orient them from scratch
    document.getElementById("spotlight1Container").className = "";
    document.getElementById("spotlight1Container").classList = [];

    document.getElementById("spotlight1NativeRadGradContainer").className = "";
    document.getElementById("spotlight1NativeRadGradContainer").classList = [];

    document.getElementById("spotlight1HBLLinkedRadGradContainer").className = "";
    document.getElementById("spotlight1HBLLinkedRadGradContainer").classList = [];

    console.log("current class after resume: " + document.getElementById("spotlight1Container").className);

    //  document.getElementById("spotlight1Container").setAttribute("id", "spotlight1Container");

    //now dealing with the ray. Just erase all the tag data after setting the class to null
    resumeS1Ray();

    resumeS1RayColors();

    resumeS1ClipPath();

    // document.getElementById("spotlight2Container").className = "";

    //Will clear everything out of the clip path out so that it can restart
    function resumeS1ClipPath() {
        let s1ClipPathCircle = document.getElementById("spotlight1ClipPath");

        s1ClipPathCircle.setAttribute("rx", "");
        s1ClipPathCircle.setAttribute("ry", "");

        let animTagX = document.querySelector("#spotlight1ClipPath_AnimTagX");
        animTagX.setAttribute("repeatCount", "");
        animTagX.setAttribute("attributeName", "");
        animTagX.setAttribute("calcMode", "");
        animTagX.setAttribute("from", "");
        animTagX.setAttribute("to", "");
        animTagX.setAttribute("dur", "");
        animTagX.setAttribute("fill", "");
        /* animTagX.setAttribute("end", ""); */
        //animTagX.endElement();

        let animTagY = document.querySelector("#spotlight1ClipPath_AnimTagY");
        animTagY.setAttribute("repeatCount", "");
        animTagY.setAttribute("attributeName", "");
        animTagY.setAttribute("calcMode", "");
        animTagY.setAttribute("from", "");
        animTagY.setAttribute("to", "");
        animTagY.setAttribute("dur", "");
        animTagY.setAttribute("fill", "");
        // animTagY.endElement();
        /* animTagY.setAttribute("end", ""); */
    }

    function resumeS1Ray() {
        let s1RaySVGCont = document.getElementById("spotlight1SVGBox");
        s1RaySVGCont.className = "";
        s1RaySVGCont.classList = [];
        let s1RayAnimateTag1 = document.querySelector("#spotlight1RayPath2_AnimTag_Stage1");
        //  s1RayAnimateTag1.endElement();
        // s1RayAnimateTag1.setAttribute("additive", "replace");
        s1RayAnimateTag1.setAttribute("repeatCount", "");
        s1RayAnimateTag1.setAttribute("calcMode", "");
        s1RayAnimateTag1.setAttribute("begin", "");
        s1RayAnimateTag1.setAttribute("from", "");
        s1RayAnimateTag1.setAttribute("to", "");
        s1RayAnimateTag1.setAttribute("dur", "");
        s1RayAnimateTag1.setAttribute("fill", "");
        s1RayAnimateTag1.setAttribute("restart", "");

        let s1RayAnimateTag2 = document.querySelector("#spotlight1RayPath2_AnimTag_Stage2");
        //  s1RayAnimateTag2.endElement();
        // s1RayAnimateTag2.setAttribute("additive", "replace");
        s1RayAnimateTag2.setAttribute("repeatCount", "");
        s1RayAnimateTag2.setAttribute("calcMode", "");
        s1RayAnimateTag2.setAttribute("begin", "");
        s1RayAnimateTag2.setAttribute("from", "");
        s1RayAnimateTag2.setAttribute("to", "");
        s1RayAnimateTag2.setAttribute("dur", "");
        s1RayAnimateTag2.setAttribute("fill", "");
        s1RayAnimateTag2.setAttribute("restart", "");
    }

    function resumeS1RayColors() {

        let animTag = document.getElementById("Gradient1_HoverTrackAnimTag_Stop2");

        animTag.setAttribute("attributeName", "");
        animTag.setAttribute("values", "");
        animTag.setAttribute("dur", "");
        animTag.setAttribute("repeatCount", "");
        animTag.endElement();


    }



    //dealing with s2

    //removing the pause class from the container
    //IMPROVED METHOD: JUST CLERAING THE ENTIRE CLASSLIST on all of the spotlight's elements to reset them so that the patrolLoop can orient them from scratch
    document.getElementById("spotlight2Container").className = "";
    document.getElementById("spotlight2Container").classList = [];

    document.getElementById("spotlight2NativeRadGradContainer").className = "";
    document.getElementById("spotlight2NativeRadGradContainer").classList = [];

    document.getElementById("spotlight2HBLLinkedRadGradContainer").className = "";
    document.getElementById("spotlight2HBLLinkedRadGradContainer").classList = [];

    resumeS2Ray();

    resumeS2ClipPath();

    resumeS2RayColors();

    function resumeS2Ray() {
        let s2RaySVGCont = document.getElementById("spotlight2SVGBox");
        s2RaySVGCont.className = "";
        s2RaySVGCont.classList = [];
        let s2RayAnimateTag1 = document.querySelector("#spotlight2RayPath2_AnimTag_Stage1");
        //  s1RayAnimateTag1.endElement();
        // s1RayAnimateTag1.setAttribute("additive", "replace");
        s2RayAnimateTag1.setAttribute("repeatCount", "");
        s2RayAnimateTag1.setAttribute("calcMode", "");
        s2RayAnimateTag1.setAttribute("begin", "");
        s2RayAnimateTag1.setAttribute("from", "");
        s2RayAnimateTag1.setAttribute("to", "");
        s2RayAnimateTag1.setAttribute("dur", "");
        s2RayAnimateTag1.setAttribute("fill", "");
        s2RayAnimateTag1.setAttribute("restart", "");

        let s2RayAnimateTag2 = document.querySelector("#spotlight2RayPath2_AnimTag_Stage2");

        s2RayAnimateTag2.setAttribute("repeatCount", "");
        s2RayAnimateTag2.setAttribute("calcMode", "");
        s2RayAnimateTag2.setAttribute("begin", "");
        s2RayAnimateTag2.setAttribute("from", "");
        s2RayAnimateTag2.setAttribute("to", "");
        s2RayAnimateTag2.setAttribute("dur", "");
        s2RayAnimateTag2.setAttribute("fill", "");
        s2RayAnimateTag2.setAttribute("restart", "");


    }

    function resumeS2ClipPath() {

        let s2ClipPathCircle = document.getElementById("spotlight2ClipPath");

        s2ClipPathCircle.setAttribute("rx", "0");
        s2ClipPathCircle.setAttribute("ry", "0");

        let animTagX = document.querySelector("#spotlight2ClipPath_AnimTagX");
        animTagX.setAttribute("repeatCount", "");
        animTagX.setAttribute("attributeName", "");
        animTagX.setAttribute("calcMode", "");
        animTagX.setAttribute("from", "");
        animTagX.setAttribute("to", "");
        animTagX.setAttribute("dur", "");
        animTagX.setAttribute("fill", "");

        let animTagY = document.querySelector("#spotlight2ClipPath_AnimTagY");
        animTagY.setAttribute("repeatCount", "");
        animTagY.setAttribute("attributeName", "");
        animTagY.setAttribute("calcMode", "");
        animTagY.setAttribute("from", "");
        animTagY.setAttribute("to", "");
        animTagY.setAttribute("dur", "");
        animTagY.setAttribute("fill", "");


    }

    function resumeS2RayColors() {

        let animTag = document.getElementById("spotlight2_Gradient_HoverTrackAnimTag_Stop2");

        animTag.setAttribute("attributeName", "");
        animTag.setAttribute("values", "");
        animTag.setAttribute("dur", "");
        animTag.setAttribute("repeatCount", "");
        animTag.endElement();

    }



   // resumeSpotlightsAnims_CSSTrigger();

}


function oneStageTrajectoryProgramLoop_S2(startCoords_S2, destCoords_S2, axisSourceCoords_S2, sweepTime_S2, extHalosOpaqueShellOffset) {

    let trigTravelModelData_S2_OneStage = calcTrigTravelModelData_OneStage(startCoords_S2, destCoords_S2, axisSourceCoords_S2);
    console.log("REnAndstimp");
    triggerSweepAndRotateForExtHalos_S2_OneStage(startCoords_S2, destCoords_S2, trigTravelModelData_S2_OneStage, sweepTime_S2);

    let s2ContTrigAccelerationData_OneStage = calcContTrigAccelerationData_OneStage(trigTravelModelData_S2_OneStage, sweepTime_S2);

    triggerContAcceleration_OneStage_S2_CSSTrigger(s2ContTrigAccelerationData_OneStage, trigTravelModelData_S2_OneStage);

    let s2ContRGFlexingData_OneStage = calcContRGFlexingData_OneStage(trigTravelModelData_S2_OneStage, sweepTime_S2);

    triggerContRGFlexing_OneStage_S2_CSSTrigger(s2ContRGFlexingData_OneStage, trigTravelModelData_S2_OneStage);

    drawAndAnimateRay_OneStage_S2(s2ContRGFlexingData_OneStage, trigTravelModelData_S2_OneStage, extHalosOpaqueShellOffset);


}

function twoStageTrajectoryProgramLoop_S1(startCoords_S1, destCoords_S1, axisSourceCoords_S1, sweepTime_S1, extHalosOpaqueShellOffset) {

    let trigTravelModelData_TwoStage_S1 = calcTrigTravelModelData_TwoStage(startCoords_S1, destCoords_S1, axisSourceCoords_S1);

    triggerSweepAndRotateForExtHalos_TwoStage_S1(startCoords_S1, destCoords_S1, trigTravelModelData_TwoStage_S1, sweepTime_S1);

    let s1ContTrigAccelerationData_TwoStage = calcContTrigAccelerationData_TwoStage(trigTravelModelData_TwoStage_S1, sweepTime_S1);

    triggerContAcceleration_TwoStage_S1_CSSTrigger(s1ContTrigAccelerationData_TwoStage, trigTravelModelData_TwoStage_S1);

    let s1ContRGFlexingData_TwoStage = calcContRGFlexingData_TwoStage(trigTravelModelData_TwoStage_S1, sweepTime_S1);

    triggerContRGFlexing_TwoStage_S1_CSSTrigger(s1ContRGFlexingData_TwoStage, trigTravelModelData_TwoStage_S1);

    drawAndAnimateRay_TwoStage_S1(s1ContRGFlexingData_TwoStage, trigTravelModelData_TwoStage_S1, extHalosOpaqueShellOffset);


}

function oneStageTrajectoryProgramLoop_S1(startCoords_S1, destCoords_S1, axisSourceCoords_S1, sweepTime_S1, extHalosOpaqueShellOffset) {

    let trigTravelModelData_S1_OneStage = calcTrigTravelModelData_OneStage(startCoords_S1, destCoords_S1, axisSourceCoords_S1);

    triggerSweepAndRotateForExtHalos_S1_OneStage(startCoords_S1, destCoords_S1, trigTravelModelData_S1_OneStage, sweepTime_S1);

    let s1ContTrigAccelerationData_OneStage = calcContTrigAccelerationData_OneStage(trigTravelModelData_S1_OneStage, sweepTime_S1);

    triggerContAcceleration_OneStage_S1_CSSTrigger(s1ContTrigAccelerationData_OneStage, trigTravelModelData_S1_OneStage);

    let s1ContRGFlexingData_OneStage = calcContRGFlexingData_OneStage(trigTravelModelData_S1_OneStage, sweepTime_S1);

    triggerContRGFlexing_OneStage_S1_CSSTrigger(s1ContRGFlexingData_OneStage, trigTravelModelData_S1_OneStage);

    drawAndAnimateRay_OneStage_S1(s1ContRGFlexingData_OneStage, trigTravelModelData_S1_OneStage, extHalosOpaqueShellOffset);
}

function twoStageTrajectoryProgramLoop_S2(startCoords_S2, destCoords_S2, axisSourceCoords_S2, sweepTime_S2, extHalosOpaqueShellOffset) {

    let trigTravelModelData_TwoStage_S2 = calcTrigTravelModelData_TwoStage(startCoords_S2, destCoords_S2, axisSourceCoords_S2);


    triggerSweepAndRotateForExtHalos_TwoStage_S2(startCoords_S2, destCoords_S2, trigTravelModelData_TwoStage_S2, sweepTime_S2);

    let s2ContTrigAccelerationData_TwoStage = calcContTrigAccelerationData_TwoStage(trigTravelModelData_TwoStage_S2, sweepTime_S2);

    triggerContAcceleration_TwoStage_S2_CSSTrigger(s2ContTrigAccelerationData_TwoStage, trigTravelModelData_TwoStage_S2);


    let s2ContRGFlexingData_TwoStage = calcContRGFlexingData_TwoStage(trigTravelModelData_TwoStage_S2, sweepTime_S2);


    triggerContRGFlexing_TwoStage_S2_CSSTrigger(s2ContRGFlexingData_TwoStage, trigTravelModelData_TwoStage_S2);

    drawAndAnimateRay_TwoStage_S2(s2ContRGFlexingData_TwoStage, trigTravelModelData_TwoStage_S2, extHalosOpaqueShellOffset);




}



//Will initialize the click listeners for menu buttons
//Will activate the Tier2 menu of the respective panel from which the button is clicked
function initializeClickListenersForMenuButtons(){

  
    //Activating the main menu buttons (tier 1)
    let tier1Buttons = document.querySelectorAll(".menuButton_Tier1");
    for (let x = 0; x < tier1Buttons.length; x = x + 1) {

        tier1Buttons[x].addEventListener("mousedown", function(event){

            //Note: Prevent default is necessary for properly implementating the stopImmediatePropagation
            event.preventDefault();
            event.stopImmediatePropagation();

            //toggling buttonLight active styles
            let buttonLight = event.target.getElementsByTagName("div")[0];
            buttonLight.classList.toggle("ButtonLightPostClick");

            //enabling the top buttons
            //navigating to neightboring div
            //The positions can differ based on which side of the HBI we are on. So we need to do some try and catch
            //Update on 4th June. We have added a new element to our menu panels (the svg lasso so we need to take this into account)
            let currPanel = event.target.parentElement;
            let neighboringPanel;


            let shooterPanel;

            //adding a nested conditional to check for elements
            if(currPanel.previousElementSibling){
                //if its traversing leftwards, the shooterpanel is the first child
                shooterPanel = currPanel.children[0];
               // console.log("topside shoote rpanel detected: " + shooterPanel.className);
             //   console.log("ShootxerPanel: " + shooterPanel.className);
                if((currPanel.previousElementSibling.previousElementSibling)){
                    
                    neighboringPanel = currPanel.previousElementSibling.previousElementSibling;
               }
        }


            else if(currPanel.nextSibling){
               //if its traversing rightwards, the shooter panel is the last child
                shooterPanel = currPanel.children[1];

                console.log("ShooterPanel: " + shooterPanel.className);
                 if(currPanel.nextSibling.nextSibling){
                neighboringPanel = currPanel.nextElementSibling.nextElementSibling;
                }
        }


            /**Changing the styles of the button shooter panel's Shots (inner children) */
            let shooterPanel_Shot1 = shooterPanel.children[0].children[0];
            let shooterPanel_Shot2 = shooterPanel.children[0].children[1];

           // console.log("Palp:shooterPanel_Shot: " + shooterPanel_Shot.className);

            shooterPanel_Shot1.classList.toggle("buttonShooterPanel_Shot");
            shooterPanel_Shot2.classList.toggle("buttonShooterPanel_Shot");
           // shooterPanel.children.children.classList.toggle("buttonShooterPanel_Shot");
           
           
            //shooterPanel.classList.toggle("buttonShooterPanelContainer");



            console.log("PostShooterPanel: " + shooterPanel.className);



            /**Changing the styles of the tier2Button container */
            let tier2ButtonsContainer = neighboringPanel;   
            tier2ButtonsContainer.classList.toggle("Tier2ButtonsContainerACTIVE");




           //console.log("neightboringPanel : " + neighboringPanel.children.className);
            //navigating to the Tier 2 buttons
            let tier2Buttons = neighboringPanel.children;

            for(let y=0; y<tier2Buttons.length; y=y+1){
                tier2Buttons[y].classList.toggle("Tier2Button_Expanded");
            }

           // neighboringPanel.children[x].classList.toggle("Tier2Button_Expanded");

           //now triggering the style change for the parent container of the tier2 buttons (i.e. neightboringPanel)
         //  neighboringPanel.classList.add("Tier2Panel_Active");

            neighboringPanel.classList.toggle("tier2Panel_ACTIVEBG");

          
            //now search for the SVG Background container div
            //it will always be the last child
            let childrenLength = neighboringPanel.children.length;
            let SVGBGContainer = neighboringPanel.children[childrenLength-1];

            SVGBGContainer.classList.toggle("Tier2Panel_SVGBG_Container_ACTIVE");


            

           



            //UPDATE: This code is irrelevant because we added a container
            //now navigating to the svg background container and tirggering that
            //we  need to loop through the nodelist to get to it

            let foundSVG;
            for(let x=0; x<neighboringPanel.children.length; x=x+1){
               console.log("loop runiing: " + Object.prototype.toString.call(neighboringPanel.children[x]));
                let currElem = neighboringPanel.children[x];
                let currElemString = Object.prototype.toString.call(neighboringPanel.children[x]);
                currElemString = neighboringPanel.children[x].className;

                //explicitly converting to string so we can use the includes method below
                currElemString = String(currElemString);
               
                if (currElemString.includes('SVGAnimatedString')){
                    foundSVG = currElem;
                   
                

                    let defsTag;
                    //now navigate to the animate tags of the radial gradient
                    //Step 1: navigate to the defs tag
                    for(let y=0; y<foundSVG.children.length; y=y+1){
                        
                        let currSvgInnerElem_nodeName = foundSVG.children[y].nodeName;

                        //traverse down to defs tag
                        if(currSvgInnerElem_nodeName == "defs"){

                            let defsTag = foundSVG.children[y];
                            let RGTag;
                            let RGTag2;
                            for(let v=0; v<defsTag.children.length; v=v+1){

                                
                                let defsTagInnerElem_nodeID = defsTag.children[v].id;
                               
                                //navigate to radial gradient
                                if (defsTagInnerElem_nodeID == "Tier2BG_RGrad1"){
                                     RGTag = defsTag.children[v];     
                                }

                                if (defsTagInnerElem_nodeID == "Tier2BG_RGrad2"){
                                    RGTag2 = defsTag.children[v];
                                    break;     
                                }

                            }




                            //conditional to check if the RG Tags already have animate tags inside
                            //we must dig down to see if there are currently animate tags present.
                            //IF there are, then delete them and return the function here.
                            let arrOfAnimTags = Array.from(RGTag.querySelectorAll("animate"));
                            
                            console.log("squid: arrOfAnimTags.length: " + arrOfAnimTags.length);

                            if (arrOfAnimTags.length > 0) {
                                
                                //loop through entire array and get each animate tag and delete
                                for (let x = 0; x < arrOfAnimTags.length; x = x + 1) {

                                    let currAnimTag = RGTag.querySelector("animate");
                                    RGTag.removeChild(currAnimTag);


                                }

                                return;
                            }
                            console.log("post-delete loop animtags Length: " + (Array.from(neighboringPanel.querySelectorAll("animate"))).length);






                                    //now create and appeend anim tag to the RG 
                                    //We have to make 4 animate tags because the SVG radial gradient has different control options for the start and end circle
                            
                                    /* RG 1 Anim START*/
                                    //Triggering end circle X coord
                                    let dynamicAnimTag_rg1_fx = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
                                    dynamicAnimTag_rg1_fx.setAttribute("attributeType", "XML");
                                    dynamicAnimTag_rg1_fx.setAttribute("attributeName", "fx");
                                    dynamicAnimTag_rg1_fx.setAttribute("dur", "50s");
                                    dynamicAnimTag_rg1_fx.setAttribute("values", "20%; 60%; 20%");
                                    dynamicAnimTag_rg1_fx.setAttribute("keyTimes", "0; 0.5; 1");
                            dynamicAnimTag_rg1_fx.setAttribute("keySplines", "0.33 0 0.78 1; 0.33 0 0.78 1");
                                    dynamicAnimTag_rg1_fx.setAttribute("calcMode", "spline"); 
                                    dynamicAnimTag_rg1_fx.setAttribute("repeatCount", "indefinite");
                                          

                                    //Triggering start circle X coord
                                    let dynamicAnimTag_rg1_cx = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
                                    dynamicAnimTag_rg1_cx.setAttribute("attributeType", "XML");
                                    dynamicAnimTag_rg1_cx.setAttribute("attributeName", "cx");
                                    dynamicAnimTag_rg1_cx.setAttribute("dur", "50s");
                                    dynamicAnimTag_rg1_cx.setAttribute("values", "20%; 60%; 20%");
                                    dynamicAnimTag_rg1_cx.setAttribute("keyTimes", "0; 0.5; 1");
                            dynamicAnimTag_rg1_cx.setAttribute("keySplines", "0.33 0 0.78 1; 0.33 0 0.78 1");
                                    dynamicAnimTag_rg1_cx.setAttribute("calcMode", "spline"); 
                                    dynamicAnimTag_rg1_cx.setAttribute("repeatCount", "indefinite");  
                                    
                                    
                                    
                                    //Triggering end circle y coord
                                    let dynamicAnimTag_rg1_fy = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
                                    dynamicAnimTag_rg1_fy.setAttribute("attributeType", "XML");
                                    dynamicAnimTag_rg1_fy.setAttribute("attributeName", "fy");
                                    dynamicAnimTag_rg1_fy.setAttribute("dur", "50s");
                                    dynamicAnimTag_rg1_fy.setAttribute("values", "20%; 20%; 20%");
                                    dynamicAnimTag_rg1_fy.setAttribute("keyTimes", "0; 0.5; 1");
                                    //dynamicAnimTag_rg1_fy.setAttribute("keySplines", "0.6 0.3 0.4 0.8; 0 0 1 1; 0.6 0.3 0.4 0.8");
                                    dynamicAnimTag_rg1_fy.setAttribute("calcMode", "linear"); 
                                    dynamicAnimTag_rg1_fy.setAttribute("repeatCount", "indefinite");    
                                  

                                    //triggering start circle y coord
                                    let dynamicAnimTag_rg1_cy = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
                                    dynamicAnimTag_rg1_cy.setAttribute("attributeType", "XML");
                                    dynamicAnimTag_rg1_cy.setAttribute("attributeName", "cy");
                                    dynamicAnimTag_rg1_cy.setAttribute("dur", "50s");
                                    dynamicAnimTag_rg1_cy.setAttribute("values", "20%; 20%; 20%");
                                    dynamicAnimTag_rg1_cy.setAttribute("keyTimes", "0; 0.5; 1");
                                 //   dynamicAnimTag_rg1_cy.setAttribute("keySplines", "0.6 0.3 0.4 0.8; 0 0 1 1; 0.6 0.3 0.4 0.8");
                                    dynamicAnimTag_rg1_cy.setAttribute("calcMode", "linear"); 
                                    dynamicAnimTag_rg1_cy.setAttribute("repeatCount", "indefinite");  
                                    

                                    //implementing stretching effects
                                    let dynamicAnimTag_rg1_fr = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
                                    dynamicAnimTag_rg1_fr.setAttribute("attributeType", "XML");
                                    dynamicAnimTag_rg1_fr.setAttribute("attributeName", "fr");
                                    dynamicAnimTag_rg1_fr.setAttribute("dur", "12s");
                                    //Remember that we have hardcoded the fr of our radial gradient to be 5%. So act withini those values
                                    dynamicAnimTag_rg1_fr.setAttribute("values", "0.5%; 15%; 0.5%");
                                    dynamicAnimTag_rg1_fr.setAttribute("keyTimes", "0; 0.5; 1");
                                    dynamicAnimTag_rg1_fr.setAttribute("repeatCount", "indefinite"); 


                                    let dynamicAnimTag_rg1_r = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
                                    dynamicAnimTag_rg1_r.setAttribute("attributeType", "XML");
                                    dynamicAnimTag_rg1_r.setAttribute("attributeName", "r");
                                    dynamicAnimTag_rg1_r.setAttribute("dur", "12s");
                                    //Remember that we have hardcoded the fr of our radial gradient to be 5%. So act withini those values
                                    dynamicAnimTag_rg1_r.setAttribute("values", "1%; 35%; 1%");
                                    dynamicAnimTag_rg1_r.setAttribute("keyTimes", "0; 0.5; 1");
                                    dynamicAnimTag_rg1_r.setAttribute("repeatCount", "indefinite"); 

        
                                    RGTag.appendChild(dynamicAnimTag_rg1_fx);
                                    RGTag.appendChild(dynamicAnimTag_rg1_cx);
                                    RGTag.appendChild(dynamicAnimTag_rg1_fy);
                                    RGTag.appendChild(dynamicAnimTag_rg1_cy);
                                    RGTag.appendChild(dynamicAnimTag_rg1_fr);

                                    dynamicAnimTag_rg1_fx.beginElement();
                                    dynamicAnimTag_rg1_cx.beginElement();
                                    dynamicAnimTag_rg1_fy.beginElement();
                                    dynamicAnimTag_rg1_cy.beginElement();
                                    dynamicAnimTag_rg1_fr.beginElement();

                                    /* RG 1 Anim END*/





                                    /* RG 2 Anim START*/

                                    //Triggering end circle X coord
                                    let dynamicAnimTag_rg2_fx = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
                                    dynamicAnimTag_rg2_fx.setAttribute("attributeType", "XML");
                                    dynamicAnimTag_rg2_fx.setAttribute("attributeName", "fx");
                                    dynamicAnimTag_rg2_fx.setAttribute("dur", "10s");
                                    dynamicAnimTag_rg2_fx.setAttribute("values", "10%; 80%; 10%");
                                    dynamicAnimTag_rg2_fx.setAttribute("keyTimes", "0; 0.5; 1");
                                    //dynamicAnimTag_rg1_fx.setAttribute("keySplines", "0.6 0.3 0.4 0.8; 0 0 1 1; 0.6 0.3 0.4 0.8");
                                    dynamicAnimTag_rg2_fx.setAttribute("calcMode", "linear");
                                    dynamicAnimTag_rg2_fx.setAttribute("repeatCount", "indefinite");


                                    //Triggering start circle X coord
                                    let dynamicAnimTag_rg2_cx = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
                                    dynamicAnimTag_rg2_cx.setAttribute("attributeType", "XML");
                                    dynamicAnimTag_rg2_cx.setAttribute("attributeName", "cx");
                                    dynamicAnimTag_rg2_cx.setAttribute("dur", "10s");
                                    dynamicAnimTag_rg2_cx.setAttribute("values", "10%; 80%; 10%");
                                    dynamicAnimTag_rg2_cx.setAttribute("keyTimes", "0; 0.5; 1");
                                    // dynamicAnimTag_rg2_cx.setAttribute("keySplines", "0.6 0.3 0.4 0.8; 0 0 1 1; 0.6 0.3 0.4 0.8");
                                    dynamicAnimTag_rg2_cx.setAttribute("calcMode", "linear");
                                    dynamicAnimTag_rg2_cx.setAttribute("repeatCount", "indefinite");



                                    //Triggering end circle y coord
                                    let dynamicAnimTag_rg2_fy = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
                                    dynamicAnimTag_rg2_fy.setAttribute("attributeType", "XML");
                                    dynamicAnimTag_rg2_fy.setAttribute("attributeName", "fy");
                                    dynamicAnimTag_rg2_fy.setAttribute("dur", "10s");
                                    dynamicAnimTag_rg2_fy.setAttribute("values", "10%; 40%; 10%");
                                    dynamicAnimTag_rg2_fy.setAttribute("keyTimes", "0; 0.5; 1");
                                    //dynamicAnimTag_rg2_fy.setAttribute("keySplines", "0.6 0.3 0.4 0.8; 0 0 1 1; 0.6 0.3 0.4 0.8");
                                    dynamicAnimTag_rg2_fy.setAttribute("calcMode", "linear");
                                    dynamicAnimTag_rg2_fy.setAttribute("repeatCount", "indefinite");


                                    //triggering start circle y coord
                                    let dynamicAnimTag_rg2_cy = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
                                    dynamicAnimTag_rg2_cy.setAttribute("attributeType", "XML");
                                    dynamicAnimTag_rg2_cy.setAttribute("attributeName", "cy");
                                    dynamicAnimTag_rg2_cy.setAttribute("dur", "10s");
                                    dynamicAnimTag_rg2_cy.setAttribute("values", "10%; 30%; 10%");
                                    dynamicAnimTag_rg2_cy.setAttribute("keyTimes", "0; 0.5; 1");
                                    //   dynamicAnimTag_rg2_cy.setAttribute("keySplines", "0.6 0.3 0.4 0.8; 0 0 1 1; 0.6 0.3 0.4 0.8");
                                    dynamicAnimTag_rg2_cy.setAttribute("calcMode", "linear");
                                    dynamicAnimTag_rg2_cy.setAttribute("repeatCount", "indefinite");


                                    //implementing stretching effects
                                    let dynamicAnimTag_rg2_fr = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
                                    dynamicAnimTag_rg2_fr.setAttribute("attributeType", "XML");
                                    dynamicAnimTag_rg2_fr.setAttribute("attributeName", "fr");
                                    dynamicAnimTag_rg2_fr.setAttribute("dur", "4s");
                                    //Remember that we have hardcoded the fr of our radial gradient to be 5%. So act withini those values
                                    dynamicAnimTag_rg2_fr.setAttribute("values", "1%; 9%; 1%");
                                    dynamicAnimTag_rg2_fr.setAttribute("keyTimes", "0; 0.5; 1");
                                    dynamicAnimTag_rg2_fr.setAttribute("repeatCount", "indefinite");


                                    RGTag.appendChild(dynamicAnimTag_rg2_fx);
                                    RGTag.appendChild(dynamicAnimTag_rg2_cx);
                                    RGTag.appendChild(dynamicAnimTag_rg2_fy);
                                    RGTag.appendChild(dynamicAnimTag_rg2_cy);
                                    RGTag.appendChild(dynamicAnimTag_rg2_fr);

                                    dynamicAnimTag_rg1_fx.beginElement();
                                    dynamicAnimTag_rg1_cx.beginElement();
                                    dynamicAnimTag_rg1_fy.beginElement();
                                    dynamicAnimTag_rg1_cy.beginElement();
                                    dynamicAnimTag_rg1_fr.beginElement();

                             
                                    /* RG 2 Anim END*/
                            



                                    //------------ RG2 Anim Start-------------------


                            /** 
                      
                            //Triggering end circle X coord
                            let dynamicAnimTag2_rg1_fx = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
                            dynamicAnimTag2_rg1_fx.setAttribute("attributeType", "XML");
                            dynamicAnimTag2_rg1_fx.setAttribute("attributeName", "fx");
                            dynamicAnimTag2_rg1_fx.setAttribute("dur", "10s");
                            dynamicAnimTag2_rg1_fx.setAttribute("values", "10%; 80%; 10%");
                            dynamicAnimTag2_rg1_fx.setAttribute("keyTimes", "0; 0.5; 1");
                            //dynamicAnimTag2_rg1_fx.setAttribute("keySplines", "0.6 0.3 0.4 0.8; 0 0 1 1; 0.6 0.3 0.4 0.8");
                            dynamicAnimTag2_rg1_fx.setAttribute("calcMode", "linear");
                            dynamicAnimTag2_rg1_fx.setAttribute("repeatCount", "indefinite");


                            //Triggering start circle X coord
                            let dynamicAnimTag2_rg1_cx = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
                            dynamicAnimTag2_rg1_cx.setAttribute("attributeType", "XML");
                            dynamicAnimTag2_rg1_cx.setAttribute("attributeName", "cx");
                            dynamicAnimTag2_rg1_cx.setAttribute("dur", "10s");
                            dynamicAnimTag2_rg1_cx.setAttribute("values", "10%; 80%; 10%");
                            dynamicAnimTag2_rg1_cx.setAttribute("keyTimes", "0; 0.5; 1");
                            // dynamicAnimTag2_rg1_cx.setAttribute("keySplines", "0.6 0.3 0.4 0.8; 0 0 1 1; 0.6 0.3 0.4 0.8");
                            dynamicAnimTag2_rg1_cx.setAttribute("calcMode", "linear");
                            dynamicAnimTag2_rg1_cx.setAttribute("repeatCount", "indefinite");



                            //Triggering end circle y coord
                            let dynamicAnimTag2_rg1_fy = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
                            dynamicAnimTag2_rg1_fy.setAttribute("attributeType", "XML");
                            dynamicAnimTag2_rg1_fy.setAttribute("attributeName", "fy");
                            dynamicAnimTag2_rg1_fy.setAttribute("dur", "10s");
                            dynamicAnimTag2_rg1_fy.setAttribute("values", "10%; 40%; 10%");
                            dynamicAnimTag2_rg1_fy.setAttribute("keyTimes", "0; 0.5; 1");
                            //dynamicAnimTag2_rg1_fy.setAttribute("keySplines", "0.6 0.3 0.4 0.8; 0 0 1 1; 0.6 0.3 0.4 0.8");
                            dynamicAnimTag2_rg1_fy.setAttribute("calcMode", "linear");
                            dynamicAnimTag2_rg1_fy.setAttribute("repeatCount", "indefinite");


                            //triggering start circle y coord
                            let dynamicAnimTag2_rg1_cy = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
                            dynamicAnimTag2_rg1_cy.setAttribute("attributeType", "XML");
                            dynamicAnimTag2_rg1_cy.setAttribute("attributeName", "cy");
                            dynamicAnimTag2_rg1_cy.setAttribute("dur", "10s");
                            dynamicAnimTag2_rg1_cy.setAttribute("values", "10%; 30%; 10%");
                            dynamicAnimTag2_rg1_cy.setAttribute("keyTimes", "0; 0.5; 1");
                            //   dynamicAnimTag2_rg1_cy.setAttribute("keySplines", "0.6 0.3 0.4 0.8; 0 0 1 1; 0.6 0.3 0.4 0.8");
                            dynamicAnimTag2_rg1_cy.setAttribute("calcMode", "linear");
                            dynamicAnimTag2_rg1_cy.setAttribute("repeatCount", "indefinite");


                            //implementing stretching effects
                            let dynamicAnimTag2_rg1_fr = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
                            dynamicAnimTag2_rg1_fr.setAttribute("attributeType", "XML");
                            dynamicAnimTag2_rg1_fr.setAttribute("attributeName", "fr");
                            dynamicAnimTag2_rg1_fr.setAttribute("dur", "4s");
                            //Remember that we have hardcoded the fr of our radial gradient to be 5%. So act withini those values
                            dynamicAnimTag2_rg1_fr.setAttribute("values", "1%; 9%; 1%");
                            dynamicAnimTag2_rg1_fr.setAttribute("keyTimes", "0; 0.5; 1");
                            dynamicAnimTag2_rg1_fr.setAttribute("repeatCount", "indefinite");


                            RGTag2.appendChild(dynamicAnimTag2_rg1_fx);
                            RGTag2.appendChild(dynamicAnimTag2_rg1_cx);
                            RGTag2.appendChild(dynamicAnimTag2_rg1_fy);
                            RGTag2.appendChild(dynamicAnimTag2_rg1_cy);
                            RGTag2.appendChild(dynamicAnimTag2_rg1_fr);

                            dynamicAnimTag2_rg1_fx.beginElement();
                            dynamicAnimTag2_rg1_cx.beginElement();
                            dynamicAnimTag2_rg1_fy.beginElement();
                            dynamicAnimTag2_rg1_cy.beginElement();
                            dynamicAnimTag2_rg1_fr.beginElement();


                            //Triggering end circle X coord
                            let dynamicAnimTag2_rg2_fx = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
                            dynamicAnimTag2_rg2_fx.setAttribute("attributeType", "XML");
                            dynamicAnimTag2_rg2_fx.setAttribute("attributeName", "fx");
                            dynamicAnimTag2_rg2_fx.setAttribute("dur", "10s");
                            dynamicAnimTag2_rg2_fx.setAttribute("values", "10%; 80%; 10%");
                            dynamicAnimTag2_rg2_fx.setAttribute("keyTimes", "0; 0.5; 1");
                            //dynamicAnimTag2_rg1_fx.setAttribute("keySplines", "0.6 0.3 0.4 0.8; 0 0 1 1; 0.6 0.3 0.4 0.8");
                            dynamicAnimTag2_rg2_fx.setAttribute("calcMode", "linear");
                            dynamicAnimTag2_rg2_fx.setAttribute("repeatCount", "indefinite");


                            //Triggering start circle X coord
                            let dynamicAnimTag2_rg2_cx = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
                            dynamicAnimTag2_rg2_cx.setAttribute("attributeType", "XML");
                            dynamicAnimTag2_rg2_cx.setAttribute("attributeName", "cx");
                            dynamicAnimTag2_rg2_cx.setAttribute("dur", "10s");
                            dynamicAnimTag2_rg2_cx.setAttribute("values", "10%; 80%; 10%");
                            dynamicAnimTag2_rg2_cx.setAttribute("keyTimes", "0; 0.5; 1");
                            // dynamicAnimTag2_rg2_cx.setAttribute("keySplines", "0.6 0.3 0.4 0.8; 0 0 1 1; 0.6 0.3 0.4 0.8");
                            dynamicAnimTag2_rg2_cx.setAttribute("calcMode", "linear");
                            dynamicAnimTag2_rg2_cx.setAttribute("repeatCount", "indefinite");



                            //Triggering end circle y coord
                            let dynamicAnimTag2_rg2_fy = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
                            dynamicAnimTag2_rg2_fy.setAttribute("attributeType", "XML");
                            dynamicAnimTag2_rg2_fy.setAttribute("attributeName", "fy");
                            dynamicAnimTag2_rg2_fy.setAttribute("dur", "10s");
                            dynamicAnimTag2_rg2_fy.setAttribute("values", "10%; 40%; 10%");
                            dynamicAnimTag2_rg2_fy.setAttribute("keyTimes", "0; 0.5; 1");
                            //dynamicAnimTag2_rg2_fy.setAttribute("keySplines", "0.6 0.3 0.4 0.8; 0 0 1 1; 0.6 0.3 0.4 0.8");
                            dynamicAnimTag2_rg2_fy.setAttribute("calcMode", "linear");
                            dynamicAnimTag2_rg2_fy.setAttribute("repeatCount", "indefinite");


                            //triggering start circle y coord
                            let dynamicAnimTag2_rg2_cy = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
                            dynamicAnimTag2_rg2_cy.setAttribute("attributeType", "XML");
                            dynamicAnimTag2_rg2_cy.setAttribute("attributeName", "cy");
                            dynamicAnimTag2_rg2_cy.setAttribute("dur", "10s");
                            dynamicAnimTag2_rg2_cy.setAttribute("values", "10%; 30%; 10%");
                            dynamicAnimTag2_rg2_cy.setAttribute("keyTimes", "0; 0.5; 1");
                            //   dynamicAnimTag2_rg2_cy.setAttribute("keySplines", "0.6 0.3 0.4 0.8; 0 0 1 1; 0.6 0.3 0.4 0.8");
                            dynamicAnimTag2_rg2_cy.setAttribute("calcMode", "linear");
                            dynamicAnimTag2_rg2_cy.setAttribute("repeatCount", "indefinite");


                            //implementing stretching effects
                            let dynamicAnimTag2_rg2_fr = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
                            dynamicAnimTag2_rg2_fr.setAttribute("attributeType", "XML");
                            dynamicAnimTag2_rg2_fr.setAttribute("attributeName", "fr");
                            dynamicAnimTag2_rg2_fr.setAttribute("dur", "4s");
                            //Remember that we have hardcoded the fr of our radial gradient to be 5%. So act withini those values
                            dynamicAnimTag2_rg2_fr.setAttribute("values", "1%; 9%; 1%");
                            dynamicAnimTag2_rg2_fr.setAttribute("keyTimes", "0; 0.5; 1");
                            dynamicAnimTag2_rg2_fr.setAttribute("repeatCount", "indefinite");


                            RGTag2.appendChild(dynamicAnimTag2_rg2_fx);
                            RGTag2.appendChild(dynamicAnimTag2_rg2_cx);
                            RGTag2.appendChild(dynamicAnimTag2_rg2_fy);
                            RGTag2.appendChild(dynamicAnimTag2_rg2_cy);
                            RGTag2.appendChild(dynamicAnimTag2_rg2_fr);

                            dynamicAnimTag2_rg1_fx.beginElement();
                            dynamicAnimTag2_rg1_cx.beginElement();
                            dynamicAnimTag2_rg1_fy.beginElement();
                            dynamicAnimTag2_rg1_cy.beginElement();
                            dynamicAnimTag2_rg1_fr.beginElement();

                            */




                                    //--------------RG2 Anim END-------------------------





                                   
                                 //   dynamicAnimTag.beginElement();

                                    //now that we all the tags in the radialGradient together, we need to figure out how to target the appropriate animate tages
                                    
                                    //let defsTagRGInnerElem_nodeName = 
                                

                            
                            
                        }
                        

                        

                    }



                    //foundSVG.setAttribute('class', 'Tier2Panel_SVGBG_ACTIVE');

                   // console.log("child of foundSVG: " + foundSVG.children[0]);
                }

            }

                //now we use javscript to change the class of the SVG because we cannot do that in CSS 
                


            //>>>>
            let rmp_firstHMT = document.querySelector(".hbi_RMP_HorzMenuTree:nth-of-type(1)");
            let rmp_firstHMT_leftP = document.querySelector("#hbi_RightMenuPanel .hbi_RMP_HorzMenuTree:nth-of-type(1) .hbi_RMP_HMT_Right");
              
            
            console.log("rmp_firstHMT_leftP::" + rmp_firstHMT_leftP.className);




        });


    }


    //testing the classlist of the right menu panel first HMT

   


}




//Will add event listeners to all the main menu buttons to make them detect mouseEnters
function initializeActiveMenuButtons(){
   
    //=======================TIER 1 BUTTONS CODE START========================================
    //Activating the main menu buttons (tier 1)
    let tier1Buttons = document.querySelectorAll(".menuButton_Tier1");
    for(let x=0; x<tier1Buttons.length; x=x+1){

        let animateInstance;

        //Pause the styles on entry into button

        tier1Buttons[x].addEventListener("mouseenter", pauseSpotlightsAnims_CSSTrigger);
        tier1Buttons[x].addEventListener("mouseenter", activateSpotlightColorAnims);
        
        tier1Buttons[x].addEventListener("focusin", pauseSpotlightsAnims_CSSTrigger);
        tier1Buttons[x].addEventListener("focusin", activateSpotlightColorAnims);

        //Engage live tracking
        tier1Buttons[x].addEventListener("mousemove", triggerTrackingSpotlightsAnim_CSSTrigger);

        //resume styles on exit
        //EDIT: YOU HAVE TO ADD AN END CURRENT ANIMS OPERATION BEFORE RESTARTING THE SPOTLIGHTS
        tier1Buttons[x].addEventListener("mouseleave", resumeSpotlightsAnims_CSSTrigger);
        tier1Buttons[x].addEventListener("focusout", resumeSpotlightsAnims_CSSTrigger);


    }



    function realTimeTrackSpotlights(e){

        realtimeTrackingAnimInstance_S1 = requestAnimationFrame(function(){

            angleSpotlightContsToMousePosition(currPos_S1[0], currPos_S1[1], e.x, e.y);

        });
        currPos_S1[0] = e.x;
        currPos_S1[1] = e.y;

      //  document.getElementById("spotlight1Container").style.border = "10px solid lawngreen";

        console.log("realtimeTrackingAnimInstance_S1: " + typeof(realtimeTrackingAnimInstance_S1));
    }




    //=======================TIER 1 BUTTONS CODE END========================================




    }


function engageSpotlightRealtimeTracking(e){



}

//Will make both spotlights sweep over to the current mouse position. This will be real time calculation (Will track the mouse in real time)
function sweepToMousePosition(e){

  //  sweepExtHalosToMousePosition(e);
    let button = document.getElementById("")

    angleSpotlightContsToMousePosition();



}






//-----START OF PATH SETTING FUNCS------------
//Will use the global pxRangeOfHBI to generate a random coordinate (in pixels) in that range.
function generateRandCoord(){

    let xCoord = (Math.random() * (pxRangeOfHBI[0][1] - pxRangeOfHBI[0][0])) + pxRangeOfHBI[0][0];
    let yCoord = (Math.random() * (pxRangeOfHBI[1][1] - pxRangeOfHBI[1][0])) + pxRangeOfHBI[1][0];

    return [xCoord, yCoord];

}



//Will generate a random sweep time (will also take into consideration how far the startPos and destPos are so that its not too quick of a sweep time)
function generateRandSweepTime(startPos, destPos){

    //note: currently generating a fixed time. you need to generate a random time

    return 20;

}


//Will take in the HTML id of an emitter and get the px position of that (it needs to get the px position of the center of that emitter.)
function getAxisSourceCoords(html_id){

    let emitter = document.getElementById(html_id);

    let emitterWidth = emitter.getBoundingClientRect().width;
    let emitterXPos =  ((emitter.getBoundingClientRect().left) + window.scrollX) + (emitterWidth/2);

    //Possible Bug Source: If you test this emitterYPos with the squarePointer, you'll find that it lands a little below where the axisSource visually renders. This could be due to the margins of all the other nearby elements displacing the point. Investigate this and take this into coinsideration
    let emitterYPos = ((emitter.getBoundingClientRect().bottom) + window.scrollY);

    return [emitterXPos, emitterYPos];


}

//-----END OF PATH SETTING FUNCS------------


//----START OF TRIG FUNCS-------

function createRandTrajectory(){

    let startCoords = generateRandCoord();

    let destCoords = generateRandCoord();

    return [startCoords, destCoords];


    //will return a randCoord within the current px range of the HBI
    function generateRandCoord() {

        let xCoord = (Math.random() * (pxRangeOfHBI[0][1] - pxRangeOfHBI[0][0])) + pxRangeOfHBI[0][0];
        let yCoord = (Math.random() * (pxRangeOfHBI[1][1] - pxRangeOfHBI[1][0])) + pxRangeOfHBI[1][0];

        return [xCoord, yCoord];

    }



}



//Will create a random trajectory that forms an appropriate triangle between the startPos, DestPos, and axisSourceCoords (the triangle must be a type where it is possible to draw the PerpLine and form point D)
function createRandTrajectory_QuadrantVersion(){

    //keep looping and generating rand coords until they pass the triangle test
    let startCoords = generateRandCoord();

    let axisSourceCoords = getAxisSourceCoords("spotlight1EmitterMock");

    let startCoords_zoneNum = checkZone(startCoords, pxRangeOfHBI);

    let destCoords_assignedZoneNum = assignDestZone(startCoords_zoneNum);

    let finalizedDestCoords;
    let quadDivisionLevel = 0;
    let workingRange = pxRangeOfHBI;

    let twoStageTriangleTest = "";

    let possibleDestCoords;

    while(twoStageTriangleTest != "TwoStage"){

        let currQuadRange = splitIntoQuads(workingRange, quadDivisionLevel, destCoords_assignedZoneNum);

        possibleDestCoords = generateRandCoordAccordingToRange(currQuadRange);

        //quadDivisionLevel = quadDivisionLevel + 1;
        console.log("quaddison lvel: " + quadDivisionLevel);

        twoStageTriangleTest = checkTrajectoryModelType(startCoords, possibleDestCoords, axisSourceCoords);
    }

    let destCoords = possibleDestCoords;



    return [startCoords, destCoords];

    //Will take in a range (XMin, XMax, YMin, YMax) and a division level and recursively split the range into quads bassed on the division level. Will select which quad to further divide by the target Quad number
    function splitIntoQuads(range, quadDivisionLevel, targetQuad){

        let finalizedRange;

        let currRange = range;

        for(let x=0; x<quadDivisionLevel; x=x+1){

            let currXMid = currRange[0][0] + ((currRange[0][1] - currRange[0][0])/2);
            let currYMid = currRange[1][0] + ((currRange[1][1] - currRange[1][0]) / 2);

            switch(targetQuad){
                case 1: currRange[0][0] = currRange[0][0];
                        currRange[0][1] = currXMid;
                        currRange[1][0] = currRange[1][0];
                        currRange[1][1] = currYMid; break;

                case 2: currRange[0][0] = currXMid;
                        currRange[0][1] = currRange[0][1];
                        currRange[1][0] = currRange[1][0];
                        currRange[1][1] = currYMid; break;

                case 3: currRange[0][0] = currRange[0][0];
                        currRange[0][1] = currXMid;
                        currRange[1][0] = currYMid;
                        currRange[1][1] = currRange[1][1]; break;


                case 4: currRange[0][0] = currXMid;
                        currRange[0][1] = currRange[0][1];
                        currRange[1][0] = currYMid;
                        currRange[1][1] = currRange[1][1]; break;

            }

        }
        return currRange;
    }

    function generateRandCoordAccordingToRange(range){

        let xCoord = (Math.random() * (range[0][1] - range[0][0])) + range[0][0];
        let yCoord = (Math.random() * (range[1][1] - range[1][0])) + range[1][0];

        return [xCoord, yCoord];

    }

    //Will take in coords and a range, and return which zone those coords fall into (top-left: quad1, top-right: quad2, bott-left: quad3, bott-right: quad4)
    function checkZone(coords, range){
        //remember that the y-value increases as we go from top to down.
        let assignedQuadNum = 0;

        let midX = range[0][0] + ((range[0][1] - range[0][0])/2);
        let midY = range[1][0] + ((range[1][1] - range[1][0]) / 2);

        //left
        if(coords[0] < (midX)){
            //up
            if(coords[1] < midY){
                assignedQuadNum = 1;
            }
            else if(coords[1] > midY){
                assignedQuadNum = 3;
            }
        }

        //right
        else if(coords[0] > midX){
            //up
            if (coords[1] < midY) {
                assignedQuadNum = 2;
            }
            else if (coords[1] > midY) {
                assignedQuadNum = 4;
            }

        }

        return assignedQuadNum;

    }

    //will assign the diagnol zone based on what zone is entered
    function assignDestZone(startCoords_zoneNum){

        let diagnolZone = 0;

        switch (startCoords_zoneNum){

            case 1: diagnolZone = 4; break;
            case 2: diagnolZone = 3; break;
            case 3: diagnolZone = 2; break;
            case 4: diagnolZone = 1; break;
        }

        return diagnolZone;



    }

}

function calcContRGFlexingData_OneStage(trigTravelModelData_OneStage, totalDuration){

    let startRad = trigTravelModelData_OneStage[0][0];
    let destRad = trigTravelModelData_OneStage[0][1];

    let cptTrajectoryLine = trigTravelModelData_OneStage[2];

    let triangleHeight = trigTravelModelData_OneStage[4];

    let cptLinearVel = getCPTLinearVel(cptTrajectoryLine, totalDuration);

    let cptTrajectory_Dur = getDurOfJourney(cptTrajectoryLine, cptLinearVel);

    let contRGFlex_BezierConfig = genBezConfigForContRGFlex_OneStage(startRad, destRad, triangleHeight);


    return [cptTrajectory_Dur, contRGFlex_BezierConfig];

    function getCPTLinearVel(trajectoryLine, duration) {

        let cptVel = trajectoryLine / duration;
        return cptVel;

    }

    function getDurOfJourney(distance, vel) {
        let dur = (distance / vel);
        return dur;
    }

    function genBezConfigForContRGFlex_OneStage(startRad, endRad, triangleHeight) {

        let config = "";
        let discrepancyRaw = startRad - endRad;

        //Now we have to consider the discrepancy in terms of the average between the 2 radiuses. That's what we are doing below
        let discrepancy = discrepancyRaw / ((startRad + endRad) / 2);
        // discrepancy = Math.abs(discrepancy);


        let discrepancyDivisor = (endRad/triangleHeight);
       // discrepancyDivisor = Math.floor(discrepancyDivisor);
        discrepancyDivisor = discrepancyDivisor * 4;

        //console.log("the discrepancyDivisor: " + discrepancyDivisor);
       // console.log("the tringle height: " + triangleHeight);
       // console.log("the end rad: " + endRad);
        //splitting the discrepancy up between 2 points (otherwise its effect will be multiplied)
        //Common sense would tell me to divide by 2 since we are applying it on 2 points, however dividing by 3 has a better effect. I AM NOT SURE WHY. This needs to be investigated
        discrepancy = discrepancy / discrepancyDivisor;

        //placing p1 and p2 at their proportional points
        let p1 = [0.33, 0.33]; let p2 = [0.66, 0.66];

        let diagnolAngleRad = (Math.PI / 180) * 45;

        //calcing the disps
        let xDisp = Math.cos(diagnolAngleRad) * discrepancy;
        let yDisp = Math.sin(diagnolAngleRad) * discrepancy;

        //turning the disps absolute so that the addition and subtraction ops don't cancel each other out
        xDisp = Math.abs(xDisp);
        yDisp = Math.abs(yDisp);


        //deciding whether to add or subtract the disps based on accelerate or decelerate
        if (discrepancy > 0) {

            p1[0] = p1[0] - xDisp;
            p1[1] = p1[1] + yDisp;

            p2[0] = p2[0] - xDisp;
            p2[1] = p2[1] + yDisp;
        }

        else if (discrepancy < 0) {

            p1[0] = p1[0] + xDisp;
            p1[1] = p1[1] - yDisp;

            p2[0] = p2[0] + xDisp;
            p2[1] = p2[1] - yDisp;

        }


        let configString = "cubic-bezier(" + p1[0] + ", " + p1[1] + ", " + p2[0] + ", " + p2[1] + ")";

        return configString;




    }

}

function calcContRGFlexingData_TwoStage(trigTravelModelData_TwoStage, totalDuration){

    let startRad = trigTravelModelData_TwoStage[0][0];
    let axisSource_to_pointD_rad = trigTravelModelData_TwoStage[0][1];
    let destRad = trigTravelModelData_TwoStage[0][2];

    let cpt_startPos_to_pointD = trigTravelModelData_TwoStage[4];
    let cpt_pointD_to_destPos = trigTravelModelData_TwoStage[5];
    let cptTrajectoryLine = trigTravelModelData_TwoStage[3];

    let cptLinearVel = getCPTLinearVel(cptTrajectoryLine, totalDuration);

    let cptTrajectory_part1Dur = getDurOfJourney(cpt_startPos_to_pointD, cptLinearVel);

    let contRGFlex_part1BezierConfig = genBezConfigForContRGFlex_TwoStage(startRad, axisSource_to_pointD_rad);

    let cptTrajectory_part2Dur = getDurOfJourney(cpt_pointD_to_destPos, cptLinearVel);

    let contRGFlex_part2BezierConfig = genBezConfigForContRGFlex_TwoStage(axisSource_to_pointD_rad, destRad);

    return [cptTrajectory_part1Dur, contRGFlex_part1BezierConfig, cptTrajectory_part2Dur, contRGFlex_part2BezierConfig];

    function getCPTLinearVel(trajectoryLine, duration) {

        let cptVel = trajectoryLine / duration;
        return cptVel;

    }

    function getDurOfJourney(distance, vel) {
        let dur = (distance / vel);
        return dur;
    }

    function genBezConfigForContRGFlex_TwoStage(startRad, endRad){

        let config = "";
        let discrepancyRaw = startRad - endRad;

        //Now we have to consider the discrepancy in terms of the average between the 2 radiuses. That's what we are doing below
        let discrepancy = discrepancyRaw / ((startRad + endRad) / 2);
        // discrepancy = Math.abs(discrepancy);

        //splitting the discrepancy up between 2 points (otherwise its effect will be multiplied)
        //Common sense would tell me to divide by 2 since we are applying it on 2 points, however dividing by 3 has a better effect. I AM NOT SURE WHY. This needs to be investigated
        discrepancy = discrepancy / 3;

        //placing p1 and p2 at their proportional points
        let p1 = [0.33, 0.33]; let p2 = [0.66, 0.66];

        let diagnolAngleRad = (Math.PI / 180) * 45;

        //calcing the disps
        let xDisp = Math.cos(diagnolAngleRad) * discrepancy;
        let yDisp = Math.sin(diagnolAngleRad) * discrepancy;

        //turning the disps absolute so that the addition and subtraction ops don't cancel each other out
        xDisp = Math.abs(xDisp);
        yDisp = Math.abs(yDisp);




        //deciding whether to add or subtract the disps based on accelerate or decelerate
        if (discrepancy > 0) {

            p1[0] = p1[0] - xDisp;
            p1[1] = p1[1] + yDisp;

            p2[0] = p2[0] - xDisp;
            p2[1] = p2[1] + yDisp;
        }

        else if (discrepancy < 0) {

            p1[0] = p1[0] + xDisp;
            p1[1] = p1[1] - yDisp;

            p2[0] = p2[0] + xDisp;
            p2[1] = p2[1] - yDisp;

        }


        let configString = "cubic-bezier(" + p1[0] + ", " + p1[1] + ", " + p2[0] + ", " + p2[1] + ")";

        return configString;




    }

}

function calcContTrigAccelerationData_OneStage(trigTravelModelData_OneStage, totalDuration){

    let startRad = trigTravelModelData_OneStage[0][0];
    let destRad = trigTravelModelData_OneStage[0][1];

    let cptTrajectoryLine = trigTravelModelData_OneStage[2];


    let cptLinearVel = getCPTLinearVel(cptTrajectoryLine, totalDuration);

    let cptTrajectory_Dur = getDurOfJourney(cptTrajectoryLine, cptLinearVel);

    let contRot_BezierConfig = genBezConfigForContAcc_OneStage(startRad, destRad);

    return [cptTrajectory_Dur, contRot_BezierConfig];

    function getCPTLinearVel(trajectoryLine, duration) {

        let cptVel = trajectoryLine / duration;

        return cptVel;


    }


    function getDurOfJourney(distance, vel) {
        let dur = (distance / vel);
        return dur;
    }

    function genBezConfigForContAcc_OneStage(startRad, endRad) {

        let config = "";
        let discrepancyRaw = startRad - endRad;

        //Now we have to consider the discrepancy in terms of the average between the 2 radiuses. That's what we are doing below
        let discrepancy = discrepancyRaw / ((startRad + endRad) / 2);
        // discrepancy = Math.abs(discrepancy);

        //splitting the discrepancy up between 2 points (otherwise its effect will be multiplied)
        //Common sense would tell me to divide by 2 since we are applying it on 2 points, however dividing by 4 has a better effect. I AM NOT SURE WHY. This needs to be investigated
        discrepancy = discrepancy / 4;

        //placing p1 and p2 at their proportional points
        let p1 = [0.33, 0.33]; let p2 = [0.66, 0.66];

        let diagnolAngleRad = (Math.PI / 180) * 45;

        //calcing the disps
        let xDisp = Math.cos(diagnolAngleRad) * discrepancy;
        let yDisp = Math.sin(diagnolAngleRad) * discrepancy;

        //turning the disps absolute so that the addition and subtraction ops don't cancel each other out
        xDisp = Math.abs(xDisp);
        yDisp = Math.abs(yDisp);


        //deciding whether to add or subtract the disps based on accelerate or decelerate
        if (discrepancy < 0) {

            p1[0] = p1[0] - xDisp;
            p1[1] = p1[1] + yDisp;

            p2[0] = p2[0] - xDisp;
            p2[1] = p2[1] + yDisp;
        }

        else if (discrepancy > 0) {

            p1[0] = p1[0] + xDisp;
            p1[1] = p1[1] - yDisp;

            p2[0] = p2[0] + xDisp;
            p2[1] = p2[1] - yDisp;

        }


        let configString = "cubic-bezier(" + p1[0] + ", " + p1[1] + ", " + p2[0] + ", " + p2[1] + ")";

        return configString;



    }

}


//Will calc the bezier configs and durs for the stages that cont has to go through.
function calcContTrigAccelerationData_TwoStage(trigTravelModelData, totalDuration){

    let startRad = trigTravelModelData[0][0];
    let axisSource_to_pointD_rad = trigTravelModelData[0][1];
    let destRad = trigTravelModelData[0][2];

    let cpt_startPos_to_pointD = trigTravelModelData[4];
    let cpt_pointD_to_destPos = trigTravelModelData[5];
    let cptTrajectoryLine = trigTravelModelData[3];



    let cptLinearVel = getCPTLinearVel(cptTrajectoryLine, totalDuration);

    let cptTrajectory_part1Dur = getDurOfJourney(cpt_startPos_to_pointD, cptLinearVel);

    let contRot_part1BezierConfig = genBezConfigForContAcc_TwoStage(startRad, axisSource_to_pointD_rad);

    let cptTrajectory_part2Dur = getDurOfJourney(cpt_pointD_to_destPos, cptLinearVel);


    let contRot_part2BezierConfig = genBezConfigForContAcc_TwoStage(axisSource_to_pointD_rad, destRad);

    return [cptTrajectory_part1Dur, contRot_part1BezierConfig, cptTrajectory_part2Dur, contRot_part2BezierConfig];

    function getCPTLinearVel(trajectoryLine, duration) {

        let cptVel = trajectoryLine / duration;

        return cptVel;


    }

    function getDurOfJourney(distance, vel) {
        let dur = (distance / vel);
        return dur;
    }

    function genBezConfigForContAcc_TwoStage(startRad, endRad) {

        let config = "";
        let discrepancyRaw = startRad - endRad;

        //Now we have to consider the discrepancy in terms of the average between the 2 radiuses. That's what we are doing below
        let discrepancy = discrepancyRaw / ((startRad+endRad)/2);
        // discrepancy = Math.abs(discrepancy);

        //splitting the discrepancy up between 2 points (otherwise its effect will be multiplied)
        //Common sense would tell me to divide by 2 since we are applying it on 2 points, however dividing by 3 has a better effect. I AM NOT SURE WHY. This needs to be investigated. Probably because the number 3 is close to PI? Try Pi
        discrepancy = discrepancy / 3;

        //placing p1 and p2 at their proportional points
        let p1 = [0.33, 0.33]; let p2 = [0.66, 0.66];

        let diagnolAngleRad = (Math.PI / 180) * 45;

        //calcing the disps
        let xDisp = Math.cos(diagnolAngleRad) * discrepancy;
        let yDisp = Math.sin(diagnolAngleRad) * discrepancy;

        //turning the disps absolute so that the addition and subtraction ops don't cancel each other out
        xDisp = Math.abs(xDisp);
        yDisp = Math.abs(yDisp);


        //deciding whether to add or subtract the disps based on accelerate or decelerate
        if (discrepancy < 0) {

            p1[0] = p1[0] - xDisp;
            p1[1] = p1[1] + yDisp;

            p2[0] = p2[0] - xDisp;
            p2[1] = p2[1] + yDisp;
        }

        else if (discrepancy > 0) {

            p1[0] = p1[0] + xDisp;
            p1[1] = p1[1] - yDisp;

            p2[0] = p2[0] + xDisp;
            p2[1] = p2[1] - yDisp;

        }


        let configString = "cubic-bezier(" + p1[0] + ", " + p1[1] + ", " + p2[0] + ", " + p2[1] + ")";

        return configString;



    }

}


//Will calculate all the data that comprises the 2 stage travel model (with point D) that is used to model the acceleration of the cont and the flexing of the Cont_RG
//Currently there are 2 variations of this function. Refer to the project folder
//Will return this data in the format [ [stage1StartRadius, Stage1EndRadius(Also acts as Stage2StartRadius), Stage2EndRadius], [Stage1StartRO, Stage1EndRO, Stage2EndRO], PointDCoords, CPTTrajectoryLine, cpt_startPos_to_pointD, cpt_pointD_to_destPos, "TwoStage"]. That last string that it returns ("TwoStage") is used to indicate to other functions what kind of trajectory it is
function calcTrigTravelModelData_TwoStage(startCoords, destCoords, axisSourceCoords){

    return calcTrigTravelModelData_TwoStage_QuickDirtyMethod(startCoords, destCoords, axisSourceCoords);

    //this is just the quickDirtymethod variation.
    function calcTrigTravelModelData_TwoStage_QuickDirtyMethod(startCoords, destCoords, axisSourceCoords){

    //finding startRadius
    let startRadius = getRadius(startCoords, axisSourceCoords);

    let destRadius = getRadius(destCoords, axisSourceCoords);

    let cptTrajectoryLine = getRadius(destCoords, startCoords);

    let angleX = Math.acos(((Math.pow(cptTrajectoryLine, 2) + Math.pow(startRadius, 2)) - (Math.pow(destRadius, 2))) / (2 * cptTrajectoryLine * startRadius));

    //console.log("ANGLEX: " + (angleX * (180/Math.PI)));

    //testing here with square pointer


    //step 2: get side cpt_startPos_to_pointD (point D is where the perpendicular line hits the CPT trajectory line)
    let cpt_startPos_to_pointD = Math.cos(angleX) * startRadius;
    let pointDDisps = getPointDDisps(startCoords, destCoords, cpt_startPos_to_pointD);

    //step 2.5: Check trajectory direction and reverse polarity if the DestPos is to the top-left of the startPos
    if(checkTrajectoryDirection(startCoords, destCoords, axisSourceCoords)=="Counter-Clockwise"){
        pointDDisps[0] = pointDDisps[0] * -1;
        pointDDisps[1] = pointDDisps[1] * -1;

      //  console.log("COUNTER CLOCKWISE DETECTED");
    }


    let pointDCoords = [(startCoords[0] + pointDDisps[0]), (startCoords[1] + pointDDisps[1])];

    //console.log("pointDDisps: " + pointDDisps);

    let pointDRadius = getRadius(pointDCoords, axisSourceCoords);

    //Test verify coordinates with square pointers
    // console.log("startradius:: " + startRadius + " , pointDRadius: " + pointDRadius + " , destRadius: " + destRadius);
   // activateStartPosSquarePointer(startCoords[0], startCoords[1]);
   // activateDestPosSquarePointer(destCoords[0], destCoords[1]);
   // activatePointDPosSquarePointer(pointDCoords[0], pointDCoords[1]);


    let startRO = getRO(startCoords, axisSourceCoords);
    let pointDRO = getRO(pointDCoords, axisSourceCoords);
    let destRO = getRO(destCoords, axisSourceCoords);

    let cpt_pointD_to_destPos = cptTrajectoryLine - cpt_startPos_to_pointD;

    //console.log(" startPOs_topointD: " + cpt_startPos_to_pointD + " , pointD_to_dest: " + cpt_pointD_to_destPos);

    return [ [startRadius, pointDRadius, destRadius], [startRO, pointDRO, destRO], pointDCoords, cptTrajectoryLine, cpt_startPos_to_pointD, cpt_pointD_to_destPos, "TwoStage"];


    //Will check the trajectory direction and type
    //Note: This needs further evaluation. Are you sure you're considering all the conditions which determines whether a path is clockwise or counter clockwise?. Take the axisSourceCoords into account. Maybe you might need to take the axisSourceCoords into account for this to work for both spotlights
    function checkTrajectoryDirection(startCoords, destCoords, axisSourceCoords){


        let trajectoryType = "Clockwise";

        //checking for spotlight 2

        if(destCoords[0] < startCoords[0]){
            if(destCoords[1] > startCoords[1]){
                trajectoryType = "Counter-Clockwise";
            }
        }




        return trajectoryType;



    }

    function getPointDDisps(startCoords, destCoords, cpt_startPos_to_pointD){

        let angleJ = Math.atan( (destCoords[1] - startCoords[1]) /  (destCoords[0] - startCoords[0]) );

        let yDisp = Math.sin(angleJ) * cpt_startPos_to_pointD;
        let xDisp = Math.cos(angleJ) * cpt_startPos_to_pointD;

        return [xDisp, yDisp];




    }



}

    //TO-DO: Fill out this function. Refer to the diagram and logic in the project folder.
    function calcTrigTravelModelData_TwoStage_NaturalTrigMethod(startCoords, destCoords, axisSourceCoords){


    }

}



function getRadius(coordPoint, axisPoint) {

    let hypSquared = Math.pow((coordPoint[0] - axisPoint[0]), 2) + Math.pow((axisPoint[1] - coordPoint[1]), 2);

    let hyp = Math.sqrt(hypSquared);

    return hyp;

}

function getRO(coordPoint, axisPoint){

    let opp = coordPoint[0] - axisPoint[0];
    let adj = axisPoint[1] - coordPoint[1];

    let ro = Math.atan( opp / adj );

    return ro;


}


//This function is to be called if our travel trajectory does not fit the TwoStage model (with point D) and instead just one stage of either acceleration or deceleration
//Will return data in the format [ [StartRadius, EndRadius], [StartRO, EndRO], CPTTrajectoryLine, "OneStage"]. That last string that it returns ("OneStage") is used to indicate to other functions what kind of trajectory it is.
function calcTrigTravelModelData_OneStage(startCoords, destCoords, axisSourceCoords){

    //finding startRadius
    let startRadius = getRadius(startCoords, axisSourceCoords);

    let destRadius = getRadius(destCoords, axisSourceCoords);

    let cptTrajectoryLine = getRadius(destCoords, startCoords);

    let startRO = getRO(startCoords, axisSourceCoords);

    let destRO = getRO(destCoords, axisSourceCoords);

    //calcing the height of the triangle (using Emitter_to_DestPos line as the base of the triangle)
    let destCoord_to_StartCoords = getRadius([startCoords[0], startCoords[1]], [destCoords[0], destCoords[1]]);

    let baseOfTriangle;
    let oppSideOfTriangle;

    //We have to add a conditional over here. The base of the triangle we use to calculate the height will depend on which is the longer side - axisSrc_to_dest or axisSrc_to_start
    if(startRadius <  destRadius){
        baseOfTriangle = destRadius;
        oppSideOfTriangle = startRadius;
    }

    else{
        baseOfTriangle = startRadius;
        oppSideOfTriangle = destRadius;
    }

    let startCoordsPointAngle = Math.acos((Math.pow(destCoord_to_StartCoords, 2) + Math.pow(oppSideOfTriangle, 2) - Math.pow(baseOfTriangle, 2)) / (2 * oppSideOfTriangle * destCoord_to_StartCoords));

    let triangleHeight = oppSideOfTriangle * Math.sin(startCoordsPointAngle);





    return [[startRadius, destRadius], [startRO, destRO], cptTrajectoryLine, "OneStage", triangleHeight];

}

//--------END OF TRIG FUNCS------------









//----START OF CSS Funcs----

//Will update the css variables involved in the sweep and rotation anims for the extHalos
function triggerSweepAndRotateForExtHalos_TwoStage_S1(startCoords, destCoords, trigTravelModelData, sweepTime){


    let startRO = trigTravelModelData[1][0];
    let destRO = trigTravelModelData[1][2];


    //inner tasks: calculate the offsets here using the global S1_Halos_Width

    triggerSweepAndRotateForHBLRG_TwoStage_S1_CSSTrigger(startCoords, destCoords, startRO, destRO, sweepTime);

    triggerSweepAndRotateForClipPath_TwoStage_S1_CSSTrigger(startCoords, destCoords, startRO, destRO, sweepTime);


    function triggerSweepAndRotateForHBLRG_TwoStage_S1_CSSTrigger(startCoords, destCoords, startRO, destRO, sweepTime){



        //we need to compensate for its current position in the DOM and subtract those offset pixels.
        let totalLeftOffset_PX = calcTotalLeftPXOffsetOfNestedElement("#spotlight1HBLLinkedRadGradContainer");
        let totalTopOffset_PX = calcTotalTopPXOffsetOfNestedElement("#spotlight1HBLLinkedRadGradContainer");

        //The pixel values we assign to the HBL_RG will start from its parent's position. So we need to subtract that out so that it will be relative to the entire HBI
        let topOffsetByImmediateContainerTop = calcTopOffsetByImmediateContainer("#spotlight1HBLLinkedRadGradContainer");
        let leftOffsetByImmediateContainerLeft = calcLeftOffsetByImmediateContainer("#spotlight1HBLLinkedRadGradContainer");


        //subtracting the offset that is caused by the parent node
        startCoords[0] =  startCoords[0] - (leftOffsetByImmediateContainerLeft);
        startCoords[1] =  startCoords[1] - (topOffsetByImmediateContainerTop);

        destCoords[0] = destCoords[0] - (leftOffsetByImmediateContainerLeft);
        destCoords[1] = destCoords[1] - topOffsetByImmediateContainerTop;



        //And now finally implementing the final offsets (half the width and half the height)
        let cptOffsetX = S1_Halos_Width/2;
        let cptOffsetyY = S1_Halos_Height/2;

        //test point: Make sure after this point that the center of the halo is aligning with the StartPos, pointDPos and DestPos square pointers.
        startCoords[0] = startCoords[0] - cptOffsetX;
        startCoords[1] = startCoords[1] - cptOffsetyY;
        destCoords[0] = destCoords[0] - cptOffsetX;
        destCoords[1] = destCoords[1] - cptOffsetyY;

        let xDiff = destCoords[0] - startCoords[0];
        let yDiff = destCoords[1] - startCoords[1];


        //Update CSS variables
        root.style.setProperty('--S1_HBL_RG_CurrX', (startCoords[0] + "px"));
        root.style.setProperty('--S1_HBL_RG_CurrY', (startCoords[1] + "px"));

        //Note: These variables are probably useless.
        root.style.setProperty('--S1_HBL_RG_DestX', (destCoords[0] + "px"));
        root.style.setProperty('--S1_HBL_RG_DestY', (destCoords[1] + "px"));

        root.style.setProperty('--S1_HBL_RG_StartRO', (startRO + "rad"));
        root.style.setProperty('--S1_HBL_RG_DestRO', (destRO + "rad"));

        root.style.setProperty('--S1_HBL_RG_XDiff', (xDiff + "px"));
        root.style.setProperty('--S1_HBL_RG_YDiff', (yDiff + "px"));

        root.style.setProperty('--S1_SweepTime', (sweepTime + "s"));

        /**
        console.log("reading css: " + root.style.getPropertyValue('--S1_HBL_RG_StartRO'));
        console.log("reading css: " + root.style.getPropertyValue('--S1_HBL_RG_DestRO'));
        */

        let S1_HBLRG = document.querySelector("#spotlight1HBLLinkedRadGradContainer");
        S1_HBLRG.classList.toggle("spotlight1HBLLinkedRadGradContainer_Moving");

        /**
        console.log("reading css: " + root.style.getPropertyValue('--S1_HBL_RG_CurrX'));
        console.log("reading css: " + root.style.getPropertyValue('--S1_HBL_RG_CurrY'));
        console.log("reading css: " + root.style.getPropertyValue('--S1_HBL_RG_DestX'));
        console.log("reading css: " + root.style.getPropertyValue('--S1_HBL_RG_DestY'));
        console.log("the classlist: " + S1_HBLRG.className);
        */


    }

    function triggerSweepAndRotateForClipPath_TwoStage_S1_CSSTrigger(startCoords, destCoords, startRO, destRO, sweepTime){

        let s1ClipPathCircle = document.getElementById("spotlight1ClipPath");
        let ClipPathSVGCont = document.getElementById("spotlightClipPathsSVGBoundingBox");

        //we won't render this we will just use it as the reference for the clip path's coordinate
        let startPoint = ClipPathSVGCont.createSVGPoint();
        let destPoint = ClipPathSVGCont.createSVGPoint();

        let startPivot = ClipPathSVGCont.createSVGPoint();
        let destPivot = ClipPathSVGCont.createSVGPoint();

        let cptOffsetX = S1_Halos_Width / 2;
        let cptOffsetyY = S1_Halos_Height / 2;


        startPoint.x = startCoords[0] + (0);
        startPoint.y = startCoords[1] + (0);

        destPoint.x = destCoords[0] + (0);
        destPoint.y = destCoords[1] + (0);



        startPivot.x = startCoords[0] + (cptOffsetX);
        startPivot.y = startCoords[1] + (cptOffsetyY);

        destPivot.x = destCoords[0] + (cptOffsetX);
        destPivot.y = destCoords[1] + (cptOffsetyY);


        let startPointConverted = startPoint.matrixTransform(ClipPathSVGCont.getCTM().inverse());
        let destPointConverted = destPoint.matrixTransform(ClipPathSVGCont.getCTM().inverse());


        //dividing the halos by 2 because we are setting radius not diameter
        s1ClipPathCircle.setAttribute("rx", (S1_Halos_Width/2)-0);
        s1ClipPathCircle.setAttribute("ry", (S1_Halos_Height/2)-0);

       // s1ClipPathCircle.setAttribute("fill", "freeze");




        //dealing with the animation

        //Dealing with translation

        let animTagX = document.querySelector("#spotlight1ClipPath_AnimTagX");
        animTagX.setAttribute("repeatCount", "1");
        animTagX.setAttribute("attributeName", "cx");
        animTagX.setAttribute("calcMode", "linear");
        animTagX.setAttribute("from", startPoint.x + S1_Halos_Width/2);
        animTagX.setAttribute("to", destPoint.x + S1_Halos_Width/2);
        animTagX.setAttribute("dur", sweepTime + "s");
        animTagX.setAttribute("fill", "freeze");
        /*After setting all the attributes, its important that we explicity start the anim tag with begin Element so that it restarts every time the program loop is called*/
        animTagX.beginElement();

        

        /**SETTING THE RESTART FUNCTIONALITY HERE */
        animTagX.addEventListener("endEvent",  globalRestartListener);



        let animTagY = document.querySelector("#spotlight1ClipPath_AnimTagY");
        animTagY.setAttribute("repeatCount", "1");
        animTagY.setAttribute("attributeName", "cy");
        animTagY.setAttribute("calcMode", "linear");
        animTagY.setAttribute("from", startPoint.y + S1_Halos_Height/2);
        animTagY.setAttribute("to", destPoint.y + S1_Halos_Height/2);
        animTagY.setAttribute("dur", sweepTime + "s");
        animTagY.setAttribute("fill", "freeze");
        animTagY.beginElement();
        /**
        let animTagTransform = document.querySelector("#spotlight1ClipPath_AnimTransformTag3");

        animTagTransform.setAttribute("from", (startPoint.x + (S1_Halos_Width / 2)) + " " + (startPoint.y + (S1_Halos_Height / 2) ))
        animTagTransform.setAttribute("to", (destPoint.x + (S1_Halos_Width / 2)) + " " + (destPoint.y + (S1_Halos_Height / 2)))
        animTagTransform.setAttribute("dur", sweepTime + "s");
        /*
        /**
        //dealing with rotation
        let animTagRotate = document.querySelector("#spotlight1ClipPath_AnimTransformTagRotate");
        animTagRotate.setAttribute("repeatCount", "1");
        // animTagRotate.setAttribute("attributeName", "y");
        animTagRotate.setAttribute("calcMode", "linear");
        animTagRotate.setAttribute("from", (startRO * (180 / Math.PI)) + " " + startPivot.x + " " + startPivot.y);
        animTagRotate.setAttribute("to", (destRO * (180 / Math.PI)) + " " + destPivot.x + " " + destPivot.y);
        animTagRotate.setAttribute("dur", sweepTime + "s");
        */

    }


    }

function triggerSweepAndRotateForExtHalos_TwoStage_S2(startCoords, destCoords, trigTravelModelData, sweepTime){


    let startRO = trigTravelModelData[1][0];
    let destRO = trigTravelModelData[1][2];

    triggerSweepAndRotateForHBLRG_TwoStage_S2_CSSTrigger(startCoords, destCoords, startRO, destRO, sweepTime);

    triggerSweepAndRotateForClipPath_TwoStage_S2_CSSTrigger(startCoords, destCoords, startRO, destRO, sweepTime);

    function triggerSweepAndRotateForHBLRG_TwoStage_S2_CSSTrigger(startCoords, destCoords, startRO, destRO, sweepTime){


        //The pixel values we assign to the HBL_RG will start from its parent's position. So we need to subtract that out so that it will be relative to the entire HBI
        let topOffsetByImmediateContainerTop = calcTopOffsetByImmediateContainer("#spotlight2HBLLinkedRadGradContainer");
        let leftOffsetByImmediateContainerLeft = calcLeftOffsetByImmediateContainer("#spotlight2HBLLinkedRadGradContainer");


        //subtracting the offset that is caused by the parent node
        startCoords[0] = startCoords[0] - leftOffsetByImmediateContainerLeft;
        startCoords[1] = startCoords[1] - topOffsetByImmediateContainerTop;

        destCoords[0] = destCoords[0] - leftOffsetByImmediateContainerLeft;
        destCoords[1] = destCoords[1] - topOffsetByImmediateContainerTop;



        //And now finally implementing the final offsets (half the width and half the height)
        let cptOffsetX = S2_Halos_Width / 2;
        let cptOffsetyY = S2_Halos_Height / 2;

        //test point: Make sure after this point that the center of the halo is aligning with the StartPos, pointDPos and DestPos square pointers.
        startCoords[0] = startCoords[0] - cptOffsetX;
        startCoords[1] = startCoords[1] - cptOffsetyY;
        destCoords[0] = destCoords[0] - cptOffsetX;
        destCoords[1] = destCoords[1] - cptOffsetyY;

        let xDiff = destCoords[0] - startCoords[0];
        let yDiff = destCoords[1] - startCoords[1];



        //Update CSS variables
        root.style.setProperty('--S2_HBL_RG_CurrX', (startCoords[0] + "px"));
        root.style.setProperty('--S2_HBL_RG_CurrY', (startCoords[1] + "px"));

        root.style.setProperty('--S2_HBL_RG_DestX', (destCoords[0] + "px"));
        root.style.setProperty('--S2_HBL_RG_DestY', (destCoords[1] + "px"));

        root.style.setProperty('--S2_HBL_RG_StartRO', (startRO + "rad"));
        root.style.setProperty('--S2_HBL_RG_DestRO', (destRO + "rad"));

        /**
        root.style.setProperty('--S2_HBL_RG_XOffset', ((cptOffsetX*2) + "px"));
        root.style.setProperty('--S2_HBL_RG_YOffset', ((cptOffsetyY*2) + "px"));
        */

        root.style.setProperty('--S2_HBL_RG_XDiff', (xDiff + "px"));
        root.style.setProperty('--S2_HBL_RG_YDiff', (yDiff + "px"));



        root.style.setProperty('--S2_SweepTime', (sweepTime + "s"));



        let S1_HBLRG = document.querySelector("#spotlight2HBLLinkedRadGradContainer");
        S1_HBLRG.classList.toggle("spotlight2HBLLinkedRadGradContainer_Moving");


    }

    function triggerSweepAndRotateForClipPath_TwoStage_S2_CSSTrigger(startCoords, destCoords, startRO, destRO, sweepTime){

        let s2ClipPathCircle = document.getElementById("spotlight2ClipPath");
        let ClipPathSVGCont = document.getElementById("spotlightClipPathsSVGBoundingBox");

        //we won't render this we will just use it as the reference for the clip path's coordinate
        let startPoint = ClipPathSVGCont.createSVGPoint();
        let destPoint = ClipPathSVGCont.createSVGPoint();

        let startPivot = ClipPathSVGCont.createSVGPoint();
        let destPivot = ClipPathSVGCont.createSVGPoint();

        let cptOffsetX = S2_Halos_Width / 2;
        let cptOffsetyY = S2_Halos_Height / 2;



        startPoint.x = startCoords[0] + (0);
        startPoint.y = startCoords[1] + (0);

        destPoint.x = destCoords[0] + (0);
        destPoint.y = destCoords[1] + (0);



        startPivot.x = startCoords[0] + (cptOffsetX);
        startPivot.y = startCoords[1] + (cptOffsetyY);

        destPivot.x = destCoords[0] + (cptOffsetX);
        destPivot.y = destCoords[1] + (cptOffsetyY);


        let startPointConverted = startPoint.matrixTransform(ClipPathSVGCont.getCTM().inverse());
        let destPointConverted = destPoint.matrixTransform(ClipPathSVGCont.getCTM().inverse());



        s2ClipPathCircle.setAttribute("rx", S2_Halos_Width/2);
        s2ClipPathCircle.setAttribute("ry", S2_Halos_Height/2);


        //dealing with the animation

        //Dealing with translation
        let animTagX = document.querySelector("#spotlight2ClipPath_AnimTagX");
        animTagX.setAttribute("repeatCount", "1");
        animTagX.setAttribute("attributeName", "cx");
        animTagX.setAttribute("calcMode", "linear");
        animTagX.setAttribute("from", startPoint.x + S2_Halos_Width/2);
        animTagX.setAttribute("to", destPoint.x + S2_Halos_Height/2);
        animTagX.setAttribute("dur", sweepTime + "s");
        animTagX.setAttribute("fill", "freeze");
        animTagX.beginElement();

        let animTagY = document.querySelector("#spotlight2ClipPath_AnimTagY");
        animTagY.setAttribute("repeatCount", "1");
        animTagY.setAttribute("attributeName", "cy");
        animTagY.setAttribute("calcMode", "linear");
        animTagY.setAttribute("from", startPoint.y + S2_Halos_Height/2);
        animTagY.setAttribute("to", destPoint.y + S2_Halos_Height/2);
        animTagY.setAttribute("dur", sweepTime + "s");
        animTagY.setAttribute("fill", "freeze");
        animTagY.beginElement();

        /**

        //dealing with rotation
        let animTagRotate = document.querySelector("#spotlight2ClipPath_AnimTransformTagRotate");
        animTagRotate.setAttribute("repeatCount", "1");
        // animTagRotate.setAttribute("attributeName", "y");
        animTagRotate.setAttribute("calcMode", "linear");
        animTagRotate.setAttribute("from", (startRO * (180 / Math.PI)) + " " + startPivot.x + " " + startPivot.y);
        animTagRotate.setAttribute("to", (destRO * (180 / Math.PI)) + " " + destPivot.x + " " + destPivot.y);
        animTagRotate.setAttribute("dur", sweepTime + "s");
        */





    }


}






//Important Note: The SVG container of the ray is using an upside down coord system, so you need to think in terms of upside down. Update documentation with this.
function drawAndAnimateRay_TwoStage_S1(flexingData, trigTravelData, extHalosOpaqueShellOffset){

    let s1RaySVGCont = document.getElementById("spotlight1SVGBox");

    let axisSrcCoords = getAxisSourceCoords("spotlight1EmitterMock");

    let emitterWidth = document.getElementById("spotlight1EmitterMock").getBoundingClientRect().width;

    //BL=Bottom left, TL = Top Left
    //Important notes: The SVG points are using the PX coordinate system. So if assign a svg point with a X value of 50, that means it moves 50 pixels to the right.
    let Ray_BL = s1RaySVGCont.createSVGPoint();
    Ray_BL.x = axisSrcCoords[0];
    Ray_BL.y = axisSrcCoords[1];
    let Ray_BL_Converted = Ray_BL.matrixTransform(s1RaySVGCont.getCTM());




    let Ray_BR = s1RaySVGCont.createSVGPoint();
    Ray_BR.x = axisSrcCoords[0];
    Ray_BR.y = axisSrcCoords[1];
    let Ray_BR_Converted = Ray_BR.matrixTransform(s1RaySVGCont.getCTM());


    //TO DO: You need to find the TL and TR positions by considering the Stage1Radius, and half of the S1_Halos_Width. Using that make a triangle and calculate the disps
    let Ray_TL = s1RaySVGCont.createSVGPoint();
    Ray_TL.x = axisSrcCoords[0] - (S1_Halos_Width/2);
    Ray_TL.y = axisSrcCoords[1] - trigTravelData[0][0];
    let Ray_TL_Converted = Ray_TL.matrixTransform(s1RaySVGCont.getCTM());

    let Ray_TR = s1RaySVGCont.createSVGPoint();
    Ray_TR.x = axisSrcCoords[0] + (S1_Halos_Width/2);
    Ray_TR.y = axisSrcCoords[1] - trigTravelData[0][0];
    let Ray_TR_Converted = Ray_TR.matrixTransform(s1RaySVGCont.getCTM());


    let Ray_CP1 = s1RaySVGCont.createSVGPoint();
    Ray_CP1.x = axisSrcCoords[0] - (S1_Halos_Width/3);
    Ray_CP1.y = axisSrcCoords[1] - trigTravelData[0][0];

    let Ray_CP1_Converted = Ray_CP1.matrixTransform(s1RaySVGCont.getCTM());



    //Setting the stage1Start Coords (remember we are working upside down so we need to factor in the container's height)
    Ray_BL.x = ((s1RaySVGCont.clientWidth)/2)-2; Ray_BL.y = s1RaySVGCont.clientHeight;
    Ray_BR.x = ((s1RaySVGCont.clientWidth) / 2) + 2; Ray_BR.y = s1RaySVGCont.clientHeight;

    Ray_TR.x = ((s1RaySVGCont.clientWidth/2) + (S1_Halos_Width/2)) - extHalosOpaqueShellOffset;
     Ray_TR.y = (s1RaySVGCont.clientHeight) - trigTravelData[0][0];

     Ray_TL.x = ((s1RaySVGCont.clientWidth/2) - (S1_Halos_Width/2)) + extHalosOpaqueShellOffset;
     Ray_TL.y = (s1RaySVGCont.clientHeight) - trigTravelData[0][0];

   // console.log("DrawAndAnimate: S1_Halos_Width: " + S1_Halos_Width);
    Ray_CP1.x = (((s1RaySVGCont.clientWidth) / 2));
     Ray_CP1.y = ((s1RaySVGCont.clientHeight) -trigTravelData[0][0]) + (S1_Halos_Height/2) + extHalosOpaqueShellOffset;

    let stage1StartRayString = createRayString_OneControlPoint(Ray_BL, Ray_BR, Ray_TR, Ray_TL, Ray_CP1);

    //creating new svg points for stage1End
    let Ray_BL_Stage1End = s1RaySVGCont.createSVGPoint();
    Ray_BL_Stage1End.x = ((s1RaySVGCont.clientWidth) / 2) - 2; Ray_BL_Stage1End.y = s1RaySVGCont.clientHeight;

    let Ray_BR_Stage1End = s1RaySVGCont.createSVGPoint();
    Ray_BR_Stage1End.x = ((s1RaySVGCont.clientWidth) / 2) + 2; Ray_BR_Stage1End.y = s1RaySVGCont.clientHeight;

    let Ray_TR_Stage1End = s1RaySVGCont.createSVGPoint();
    Ray_TR_Stage1End.x = ((s1RaySVGCont.clientWidth/2) + (S1_Halos_Width/2)) - extHalosOpaqueShellOffset; Ray_TR_Stage1End.y = ((s1RaySVGCont.clientHeight) - trigTravelData[0][1]);

    let Ray_TL_Stage1End = s1RaySVGCont.createSVGPoint();
    Ray_TL_Stage1End.x = ((s1RaySVGCont.clientWidth/2) - (S1_Halos_Width/2)) + extHalosOpaqueShellOffset; Ray_TL_Stage1End.y = (s1RaySVGCont.clientHeight) - trigTravelData[0][1];

    let Ray_CP1_Stage1End = s1RaySVGCont.createSVGPoint();
    Ray_CP1_Stage1End.x = ((s1RaySVGCont.clientWidth/2));
     Ray_CP1_Stage1End.y = ((s1RaySVGCont.clientHeight) - trigTravelData[0][1]) + (S1_Halos_Height/2) + extHalosOpaqueShellOffset;



    let stage1EndRayString = createRayString_OneControlPoint(Ray_BL_Stage1End, Ray_BR_Stage1End, Ray_TR_Stage1End, Ray_TL_Stage1End, Ray_CP1_Stage1End);



    //
    let Ray_BL_Stage2Start = s1RaySVGCont.createSVGPoint();
    Ray_BL_Stage2Start.x = ((s1RaySVGCont.clientWidth) / 2) - 2; Ray_BL_Stage2Start.y = s1RaySVGCont.clientHeight;

    let Ray_BR_Stage2Start = s1RaySVGCont.createSVGPoint();
    Ray_BR_Stage2Start.x = ((s1RaySVGCont.clientWidth) / 2) + 2; Ray_BR_Stage2Start.y = s1RaySVGCont.clientHeight;

    let Ray_TR_Stage2Start = s1RaySVGCont.createSVGPoint();
    Ray_TR_Stage2Start.x = ((s1RaySVGCont.clientWidth/2) + (S1_Halos_Width/2)) - extHalosOpaqueShellOffset; Ray_TR_Stage2Start.y = (s1RaySVGCont.clientHeight) - trigTravelData[0][1];

    let Ray_TL_Stage2Start = s1RaySVGCont.createSVGPoint();
    Ray_TL_Stage2Start.x = ((s1RaySVGCont.clientWidth/2) - (S1_Halos_Width/2)) + extHalosOpaqueShellOffset; Ray_TL_Stage2Start.y = (s1RaySVGCont.clientHeight) - trigTravelData[0][1];

    let Ray_CP1_Stage2Start = s1RaySVGCont.createSVGPoint();
    Ray_CP1_Stage2Start.x = ((s1RaySVGCont.clientWidth/2));
     Ray_CP1_Stage2Start.y = ((s1RaySVGCont.clientHeight) - trigTravelData[0][1]) + (S1_Halos_Height / 2) + extHalosOpaqueShellOffset;


    //setting the stage2Start Coords by REASSIGNING EXISTING VARS (remember we are working upside down so we need to factor in the container's height)
    let stage2StartRayString = createRayString_OneControlPoint(Ray_BL_Stage2Start, Ray_BR_Stage2Start, Ray_TR_Stage2Start, Ray_TL_Stage2Start, Ray_CP1_Stage2Start);


    //creating new svg points for stage2End
    let Ray_BL_Stage2End = s1RaySVGCont.createSVGPoint();
    Ray_BL_Stage2End.x = ((s1RaySVGCont.clientWidth) / 2) - 2; Ray_BL_Stage2End.y = s1RaySVGCont.clientHeight;

    let Ray_BR_Stage2End = s1RaySVGCont.createSVGPoint();
    Ray_BR_Stage2End.x = ((s1RaySVGCont.clientWidth) / 2) + 2; Ray_BR_Stage2End.y = s1RaySVGCont.clientHeight;

    let Ray_TR_Stage2End = s1RaySVGCont.createSVGPoint();
    Ray_TR_Stage2End.x = ((s1RaySVGCont.clientWidth/2) + (S1_Halos_Width/2)) - extHalosOpaqueShellOffset; Ray_TR_Stage2End.y = (s1RaySVGCont.clientHeight) - trigTravelData[0][2];

    let Ray_TL_Stage2End = s1RaySVGCont.createSVGPoint();
    Ray_TL_Stage2End.x = ((s1RaySVGCont.clientWidth/2) - (S1_Halos_Width/2)) + extHalosOpaqueShellOffset; Ray_TL_Stage2End.y = (s1RaySVGCont.clientHeight) - trigTravelData[0][2];

    let Ray_CP1_Stage2End = s1RaySVGCont.createSVGPoint();
    Ray_CP1_Stage2End.x = ((s1RaySVGCont.clientWidth/2));
     Ray_CP1_Stage2End.y = ((s1RaySVGCont.clientHeight) - trigTravelData[0][2]) + (S1_Halos_Height / 2) + extHalosOpaqueShellOffset;



    //setting the stage2End Coords by REASSIGNING EXISTING VARS (remember we are working upside down so we need to factor in the container's height)
    let stage2EndRayString = createRayString_OneControlPoint(Ray_BL_Stage2End, Ray_BR_Stage2End, Ray_TR_Stage2End, Ray_TL_Stage2End, Ray_CP1_Stage2End);


    //Setting the stage1 Animation
    let s1RayAnimateTag1 = document.querySelector("#spotlight1RayPath2_AnimTag_Stage1");
    s1RayAnimateTag1.setAttribute("repeatCount", "1");
    s1RayAnimateTag1.setAttribute("calcMode", "linear");
    //  s1RayAnimateTag1.setAttribute("d", startPosRayString);
  //  s1RayAnimateTag1.setAttribute("begin", 0 + "s");
    s1RayAnimateTag1.setAttribute("from", stage1StartRayString);
    s1RayAnimateTag1.setAttribute("to", stage1EndRayString);
    s1RayAnimateTag1.setAttribute("dur", flexingData[0] + "s");
    s1RayAnimateTag1.setAttribute("fill", "freeze");
    s1RayAnimateTag1.setAttribute("restart", "always");
   // s1RayAnimateTag1.endElement();
    s1RayAnimateTag1.beginElement();

    console.log("s1rayanimatetag1: " +  s1RayAnimateTag1.begininstancetimeslist);


    //Setting the Stage 2 Animation

    let s1RayAnimateTag2 = document.querySelector("#spotlight1RayPath2_AnimTag_Stage2");
    s1RayAnimateTag2.setAttribute("repeatCount", "1");
    s1RayAnimateTag2.setAttribute("calcMode", "linear");

   // s1RayAnimateTag2.setAttribute("begin", flexingData[0] + "s");

    s1RayAnimateTag2.setAttribute("from", stage2StartRayString);
    s1RayAnimateTag2.setAttribute("to", stage2EndRayString);
    s1RayAnimateTag2.setAttribute("dur", flexingData[2] + "s");
    s1RayAnimateTag2.setAttribute("fill", "freeze");
    s1RayAnimateTag2.setAttribute("restart", "always");
   // s1RayAnimateTag2.beginElementAt(flexingData[0]);
    //s1RayAnimateTag2.setAttribute("begin", "spotlight1RayPath2_AnimTag_Stage1.end");
    s1RayAnimateTag2.setAttribute("begin", flexingData[2] + "s");
    s1RayAnimateTag2.beginElement();
    
   // s1RayAnimateTag2.beginElement();

   // let path = document.querySelector("#RayPath2");
    //path.setAttribute("d", startPosRayString);


}


function drawAndAnimateRay_TwoStage_S2(flexingData, trigTravelData, extHalosOpaqueShellOffset){



    let s2RaySVGCont = document.getElementById("spotlight2SVGBox");

    let axisSrcCoords = getAxisSourceCoords("spotlight2EmitterMock");

    //BL=Bottom left, TL = Top Left
    //Important notes: The SVG points are using the PX coordinate system. So if assign a svg point with a X value of 50, that means it moves 50 pixels to the right.
    let Ray_BL = s2RaySVGCont.createSVGPoint();
    Ray_BL.x = axisSrcCoords[0];
    Ray_BL.y = axisSrcCoords[1];


    let Ray_BR = s2RaySVGCont.createSVGPoint();
    Ray_BR.x = axisSrcCoords[0];
    Ray_BR.y = axisSrcCoords[1];

    //TO DO: You need to find the TL and TR positions by considering the Stage1Radius, and half of the S1_Halos_Width. Using that make a triangle and calculate the disps
    let Ray_TL = s2RaySVGCont.createSVGPoint();
    Ray_TL.x = axisSrcCoords[0] - (S2_Halos_Width/2);
    Ray_TL.y = axisSrcCoords[1] - trigTravelData[0][0];

    let Ray_TR = s2RaySVGCont.createSVGPoint();
    Ray_TR.x = axisSrcCoords[0] + (S2_Halos_Width/2);
    Ray_TR.y = axisSrcCoords[1] - trigTravelData[0][0];

    let Ray_CP1 = s2RaySVGCont.createSVGPoint();
    Ray_CP1.x = axisSrcCoords[0] - (S2_Halos_Width/3);
    Ray_CP1.y = axisSrcCoords[1] - trigTravelData[0][0];

    let Ray_CP2 = s2RaySVGCont.createSVGPoint();
    Ray_CP2.x = axisSrcCoords[0] + (S2_Halos_Width / 3);
    Ray_CP2.y = axisSrcCoords[1] - trigTravelData[0][0];

     //Setting the stage1Start Coords (remember we are working upside down so we need to factor in the container's height)
    Ray_BL.x = ((s2RaySVGCont.clientWidth) / 2) - 2; Ray_BL.y = s2RaySVGCont.clientHeight;
    Ray_BR.x = ((s2RaySVGCont.clientWidth) / 2) + 2; Ray_BR.y = s2RaySVGCont.clientHeight;

    Ray_TR.x = ((s2RaySVGCont.clientWidth / 2) + (S2_Halos_Width / 2)) - extHalosOpaqueShellOffset;
    Ray_TR.y = (s2RaySVGCont.clientHeight) - trigTravelData[0][0];

    Ray_TL.x = ((s2RaySVGCont.clientWidth / 2) - (S2_Halos_Width / 2)) + extHalosOpaqueShellOffset;
    Ray_TL.y = (s2RaySVGCont.clientHeight) - trigTravelData[0][0];


    Ray_CP1.x = ((s2RaySVGCont.clientWidth) / 2);
    Ray_CP1.y = ((s2RaySVGCont.clientHeight) - trigTravelData[0][0]) + (S2_Halos_Height / 1);
    Ray_CP2.x = (((s2RaySVGCont.clientWidth) / 2) + (S2_Halos_Width / 4)) - extHalosOpaqueShellOffset;
    Ray_CP2.y = ((s2RaySVGCont.clientHeight) - trigTravelData[0][0]) + (S2_Halos_Height / 2);

    let stage1StartRayString = createRayString_OneControlPoint(Ray_BL, Ray_BR, Ray_TR, Ray_TL, Ray_CP1);

    //creating new svg points for stage1End
    let Ray_BL_Stage1End = s2RaySVGCont.createSVGPoint();
    Ray_BL_Stage1End.x = ((s2RaySVGCont.clientWidth) / 2) - 2; Ray_BL_Stage1End.y = s2RaySVGCont.clientHeight;

    let Ray_BR_Stage1End = s2RaySVGCont.createSVGPoint();
    Ray_BR_Stage1End.x = ((s2RaySVGCont.clientWidth) / 2) + 2; Ray_BR_Stage1End.y = s2RaySVGCont.clientHeight;


    let Ray_TR_Stage1End = s2RaySVGCont.createSVGPoint();
    Ray_TR_Stage1End.x = ((s2RaySVGCont.clientWidth / 2) + (S2_Halos_Width / 2)) - extHalosOpaqueShellOffset;
        Ray_TR_Stage1End.y = ((s2RaySVGCont.clientHeight) - trigTravelData[0][1]);

    let Ray_TL_Stage1End = s2RaySVGCont.createSVGPoint();
    Ray_TL_Stage1End.x = ((s2RaySVGCont.clientWidth / 2) - (S2_Halos_Width / 2)) + extHalosOpaqueShellOffset;
        Ray_TL_Stage1End.y = (s2RaySVGCont.clientHeight) - trigTravelData[0][1];

    let Ray_CP1_Stage1End = s2RaySVGCont.createSVGPoint();
    Ray_CP1_Stage1End.x = ((s2RaySVGCont.clientWidth / 2) - (S2_Halos_Width / 4)) + extHalosOpaqueShellOffset;
    Ray_CP1_Stage1End.y = ((s2RaySVGCont.clientHeight) - trigTravelData[0][1]) + (S2_Halos_Height / 2);

    let Ray_CP2_Stage1End = s2RaySVGCont.createSVGPoint();
    Ray_CP2_Stage1End.x = ((s2RaySVGCont.clientWidth / 2) + (S2_Halos_Width / 4)) - extHalosOpaqueShellOffset;
    Ray_CP2_Stage1End.y = ((s2RaySVGCont.clientHeight) - trigTravelData[0][1]) + (S2_Halos_Height / 2);

    let stage1EndRayString = createRayString_OneControlPoint(Ray_BL_Stage1End, Ray_BR_Stage1End, Ray_TR_Stage1End, Ray_TL_Stage1End, Ray_CP1_Stage1End);



    let Ray_BL_Stage2Start = s2RaySVGCont.createSVGPoint();
    Ray_BL_Stage2Start.x = ((s2RaySVGCont.clientWidth) / 2) - 2; Ray_BL_Stage2Start.y = s2RaySVGCont.clientHeight;

    let Ray_BR_Stage2Start = s2RaySVGCont.createSVGPoint();
    Ray_BR_Stage2Start.x = ((s2RaySVGCont.clientWidth) / 2) + 2; Ray_BR_Stage2Start.y = s2RaySVGCont.clientHeight;

    let Ray_TR_Stage2Start = s2RaySVGCont.createSVGPoint();
    Ray_TR_Stage2Start.x = ((s2RaySVGCont.clientWidth / 2) + (S2_Halos_Width / 2)) - extHalosOpaqueShellOffset;
        Ray_TR_Stage2Start.y = (s2RaySVGCont.clientHeight) - trigTravelData[0][1];

    let Ray_TL_Stage2Start = s2RaySVGCont.createSVGPoint();
    Ray_TL_Stage2Start.x = ((s2RaySVGCont.clientWidth / 2) - (S2_Halos_Width / 2)) + extHalosOpaqueShellOffset;
        Ray_TL_Stage2Start.y = (s2RaySVGCont.clientHeight) - trigTravelData[0][1];


    let Ray_CP1_Stage2Start = s2RaySVGCont.createSVGPoint();
    Ray_CP1_Stage2Start.x = ((s2RaySVGCont.clientWidth) / 2);
    Ray_CP1_Stage2Start.y = ((s2RaySVGCont.clientHeight) - trigTravelData[0][1]) + (S2_Halos_Height / 1);

    let Ray_CP2_Stage2Start = s2RaySVGCont.createSVGPoint();
    Ray_CP2_Stage2Start.x = ((s2RaySVGCont.clientWidth / 2) + (S2_Halos_Width / 4)) - extHalosOpaqueShellOffset;
    Ray_CP2_Stage2Start.y = ((s2RaySVGCont.clientHeight) - trigTravelData[0][1]) + (S2_Halos_Height / 2);


    //setting the stage2Start Coords by REASSIGNING EXISTING VARS (remember we are working upside down so we need to factor in the container's height)
    let stage2StartRayString = createRayString_OneControlPoint(Ray_BL_Stage2Start, Ray_BR_Stage2Start, Ray_TR_Stage2Start, Ray_TL_Stage2Start, Ray_CP1_Stage2Start);


    //creating new svg points for stage2End
    let Ray_BL_Stage2End = s2RaySVGCont.createSVGPoint();
    Ray_BL_Stage2End.x = ((s2RaySVGCont.clientWidth) / 2) - 2; Ray_BL_Stage2End.y = s2RaySVGCont.clientHeight;

    let Ray_BR_Stage2End = s2RaySVGCont.createSVGPoint();
    Ray_BR_Stage2End.x = ((s2RaySVGCont.clientWidth) / 2) + 2; Ray_BR_Stage2End.y = s2RaySVGCont.clientHeight;

    let Ray_TR_Stage2End = s2RaySVGCont.createSVGPoint();
    Ray_TR_Stage2End.x = ((s2RaySVGCont.clientWidth / 2) + (S2_Halos_Width / 2)) - extHalosOpaqueShellOffset;
     Ray_TR_Stage2End.y = (s2RaySVGCont.clientHeight) - trigTravelData[0][2];

    let Ray_TL_Stage2End = s2RaySVGCont.createSVGPoint();
    Ray_TL_Stage2End.x = ((s2RaySVGCont.clientWidth / 2) - (S2_Halos_Width / 2)) + extHalosOpaqueShellOffset;
     Ray_TL_Stage2End.y = (s2RaySVGCont.clientHeight) - trigTravelData[0][2];

    let Ray_CP1_Stage2End = s2RaySVGCont.createSVGPoint();
    Ray_CP1_Stage2End.x = ((s2RaySVGCont.clientWidth) / 2);
    Ray_CP1_Stage2End.y = ((s2RaySVGCont.clientHeight) - trigTravelData[0][2]) + (S2_Halos_Height / 1);

    let Ray_CP2_Stage2End = s2RaySVGCont.createSVGPoint();
    Ray_CP2_Stage2End.x = ((s2RaySVGCont.clientWidth / 2) + ((S2_Halos_Width / 4))) - extHalosOpaqueShellOffset;
    Ray_CP2_Stage2End.y = ((s2RaySVGCont.clientHeight) - trigTravelData[0][2]) + (S2_Halos_Height / 2);

     //setting the stage2End Coords by REASSIGNING EXISTING VARS (remember we are working upside down so we need to factor in the container's height)
    let stage2EndRayString = createRayString_OneControlPoint(Ray_BL_Stage2End, Ray_BR_Stage2End, Ray_TR_Stage2End, Ray_TL_Stage2End, Ray_CP1_Stage2End);




    //Setting the stage1 Animation
    let s2RayAnimateTag1 = document.querySelector("#spotlight2RayPath2_AnimTag_Stage1");
    s2RayAnimateTag1.setAttribute("repeatCount", "1");
    s2RayAnimateTag1.setAttribute("calcMode", "linear");
    //  s1RayAnimateTag1.setAttribute("d", startPosRayString);
   // s2RayAnimateTag1.setAttribute("begin", 0 + "s");
    s2RayAnimateTag1.setAttribute("from", stage1StartRayString);
    s2RayAnimateTag1.setAttribute("to", stage1EndRayString);
    s2RayAnimateTag1.setAttribute("dur", flexingData[0] + "s");
    s2RayAnimateTag1.setAttribute("fill", "freeze");
    s2RayAnimateTag1.setAttribute("restart", "always");
    s2RayAnimateTag1.beginElement();



    //Setting the Stage 2 Animation

    let s2RayAnimateTag2 = document.querySelector("#spotlight2RayPath2_AnimTag_Stage2");
    s2RayAnimateTag2.setAttribute("repeatCount", "1");
    s2RayAnimateTag2.setAttribute("calcMode", "linear");

    //s2RayAnimateTag2.setAttribute("begin", flexingData[0] + "s");

    s2RayAnimateTag2.setAttribute("from", stage2StartRayString);
    s2RayAnimateTag2.setAttribute("to", stage2EndRayString);
    s2RayAnimateTag2.setAttribute("dur", flexingData[2] + "s");
    s2RayAnimateTag2.setAttribute("fill", "freeze");
    s2RayAnimateTag2.setAttribute("restart", "always");
    s2RayAnimateTag2.setAttribute("begin", "spotlight2RayPath2_AnimTag_Stage1.end");





}


function drawAndAnimateRay_OneStage_S1(flexingData, trigTravelData, extHalosOpaqueShellOffset){

    let s1RaySVGCont = document.getElementById("spotlight1SVGBox");

    let axisSrcCoords = getAxisSourceCoords("spotlight1EmitterMock");

    let Ray_BL_Start = s1RaySVGCont.createSVGPoint();
    Ray_BL_Start.x = axisSrcCoords[0];
    Ray_BL_Start.y = axisSrcCoords[1];

    let Ray_BR_Start = s1RaySVGCont.createSVGPoint();
    Ray_BR_Start.x = axisSrcCoords[0];
    Ray_BR_Start.y = axisSrcCoords[1];

    let Ray_TL_Start = s1RaySVGCont.createSVGPoint();
    Ray_TL_Start.x = axisSrcCoords[0] - (S1_Halos_Width / 2);
    Ray_TL_Start.y = axisSrcCoords[1] - trigTravelData[0][0];

    let Ray_TR_Start = s1RaySVGCont.createSVGPoint();
    Ray_TR_Start.x = axisSrcCoords[0] + (S1_Halos_Width / 2);
    Ray_TR_Start.y = axisSrcCoords[1] - trigTravelData[0][0];


    let Ray_CP1_Start = s1RaySVGCont.createSVGPoint();
    Ray_CP1_Start.x = axisSrcCoords[0] - (S1_Halos_Width / 3);
    Ray_CP1_Start.y = axisSrcCoords[1] - trigTravelData[0][0];

    let Ray_CP2_Start = s1RaySVGCont.createSVGPoint();
    Ray_CP2_Start.x = axisSrcCoords[0] + (S1_Halos_Width / 3);
    Ray_CP2_Start.y = axisSrcCoords[1] - trigTravelData[0][0];

    //Setting the Start Coords (remember we are working upside down so we need to factor in the container's height)
    Ray_BL_Start.x = ((s1RaySVGCont.clientWidth) / 2) - 2; Ray_BL_Start.y = s1RaySVGCont.clientHeight;
    Ray_BR_Start.x = ((s1RaySVGCont.clientWidth) / 2) + 2; Ray_BR_Start.y = s1RaySVGCont.clientHeight;
    Ray_TR_Start.x = ((s1RaySVGCont.clientWidth / 2) + (S1_Halos_Width / 2)) - extHalosOpaqueShellOffset; Ray_TR_Start.y = (s1RaySVGCont.clientHeight) - trigTravelData[0][0];
    Ray_TL_Start.x = ((s1RaySVGCont.clientWidth / 2) - (S1_Halos_Width / 2)) + extHalosOpaqueShellOffset; Ray_TL_Start.y = (s1RaySVGCont.clientHeight) - trigTravelData[0][0];

    Ray_CP1_Start.x = (S1_Halos_Width / 4); Ray_CP1_Start.y = ((s1RaySVGCont.clientHeight) - trigTravelData[0][0]) + (S1_Halos_Height / 2);
    Ray_CP2_Start.x = (S1_Halos_Width / 4) * 3; Ray_CP2_Start.y = ((s1RaySVGCont.clientHeight) - trigTravelData[0][0]) + (S1_Halos_Height / 2);

    let startRayString = createRayString_OneControlPoint(Ray_BL_Start, Ray_BR_Start, Ray_TR_Start, Ray_TL_Start, Ray_CP1_Start);




    //creating new svg points for End stage
    let Ray_BL_End = s1RaySVGCont.createSVGPoint();
    Ray_BL_End.x = ((s1RaySVGCont.clientWidth) / 2) - 2; Ray_BL_End.y = s1RaySVGCont.clientHeight;

    let Ray_BR_End = s1RaySVGCont.createSVGPoint();
    Ray_BR_End.x = ((s1RaySVGCont.clientWidth) / 2) + 2; Ray_BR_End.y = s1RaySVGCont.clientHeight;

    let Ray_TR_End = s1RaySVGCont.createSVGPoint();
    Ray_TR_End.x = ((s1RaySVGCont.clientWidth / 2) + (S1_Halos_Width / 2)) - extHalosOpaqueShellOffset; Ray_TR_End.y = (s1RaySVGCont.clientHeight) - trigTravelData[0][1];

    let Ray_TL_End = s1RaySVGCont.createSVGPoint();
    Ray_TL_End.x = ((s1RaySVGCont.clientWidth / 2) - (S1_Halos_Width / 2)) + extHalosOpaqueShellOffset; Ray_TL_End.y = (s1RaySVGCont.clientHeight) - trigTravelData[0][1];

    let Ray_CP1_End = s1RaySVGCont.createSVGPoint();
    Ray_CP1_End.x = ((s1RaySVGCont.clientWidth / 2) - (S1_Halos_Width / 4)) + extHalosOpaqueShellOffset; Ray_CP1_End.y = ((s1RaySVGCont.clientHeight) - trigTravelData[0][1]) + (S1_Halos_Height / 2);

    let Ray_CP2_End = s1RaySVGCont.createSVGPoint();
    Ray_CP2_End.x = ((s1RaySVGCont.clientWidth / 2) + ((S1_Halos_Width / 4) * 3)) - extHalosOpaqueShellOffset; Ray_CP2_End.y = ((s1RaySVGCont.clientHeight) - trigTravelData[0][1]) + (S1_Halos_Height / 2);

    //setting the stage2End Coords by REASSIGNING EXISTING VARS (remember we are working upside down so we need to factor in the container's height)
    let endRayString = createRayString_OneControlPoint(Ray_BL_End, Ray_BR_End, Ray_TR_End, Ray_TL_End, Ray_CP1_End);




    //Setting the oneStage Animation
    let s1RayAnimateTag1 = document.querySelector("#spotlight1RayPath2_AnimTag_Stage1");
    s1RayAnimateTag1.setAttribute("repeatCount", "1");
    s1RayAnimateTag1.setAttribute("calcMode", "linear");
    //  s1RayAnimateTag1.setAttribute("d", startPosRayString);
   // s1RayAnimateTag1.setAttribute("begin", 0 + "s");
    s1RayAnimateTag1.setAttribute("from", startRayString);
    s1RayAnimateTag1.setAttribute("to", endRayString);
    s1RayAnimateTag1.setAttribute("dur", flexingData[0] + "s");
    s1RayAnimateTag1.setAttribute("fill", "freeze");
    s1RayAnimateTag1.setAttribute("restart", "always");
    
   // s1RayAnimateTag1.endElement();
    s1RayAnimateTag1.beginElement();


}

function drawAndAnimateRay_OneStage_S2(flexingData, trigTravelData, extHalosOpaqueShellOffset){

    let s2RaySVGCont = document.getElementById("spotlight2SVGBox");

    let axisSrcCoords = getAxisSourceCoords("spotlight2EmitterMock");

    let Ray_BL_Start = s2RaySVGCont.createSVGPoint();
    Ray_BL_Start.x = axisSrcCoords[0];
    Ray_BL_Start.y = axisSrcCoords[1];

    let Ray_BR_Start = s2RaySVGCont.createSVGPoint();
    Ray_BR_Start.x = axisSrcCoords[0];
    Ray_BR_Start.y = axisSrcCoords[1];

    let Ray_TL_Start = s2RaySVGCont.createSVGPoint();
    Ray_TL_Start.x = axisSrcCoords[0] - (S2_Halos_Width / 2);
    Ray_TL_Start.y = axisSrcCoords[1] - trigTravelData[0][0];


    let Ray_TR_Start = s2RaySVGCont.createSVGPoint();
    Ray_TR_Start.x = axisSrcCoords[0] + (S2_Halos_Width / 2);
    Ray_TR_Start.y = axisSrcCoords[1] - trigTravelData[0][0];


    let Ray_CP1_Start = s2RaySVGCont.createSVGPoint();
    Ray_CP1_Start.x = axisSrcCoords[0] - (S2_Halos_Width / 3);
    Ray_CP1_Start.y = axisSrcCoords[1] - trigTravelData[0][0];

    let Ray_CP2_Start = s2RaySVGCont.createSVGPoint();
    Ray_CP2_Start.x = axisSrcCoords[0] + (S2_Halos_Width / 3);
    Ray_CP2_Start.y = axisSrcCoords[1] - trigTravelData[0][0];


    //Setting the Start Coords (remember we are working upside down so we need to factor in the container's height)
    Ray_BL_Start.x = ((s2RaySVGCont.clientWidth) / 2) - 2; Ray_BL_Start.y = s2RaySVGCont.clientHeight;
    Ray_BR_Start.x = ((s2RaySVGCont.clientWidth) / 2) + 2; Ray_BR_Start.y = s2RaySVGCont.clientHeight;
    Ray_TR_Start.x = ((s2RaySVGCont.clientWidth / 2) + (S2_Halos_Width / 2)) - extHalosOpaqueShellOffset;
     Ray_TR_Start.y = (s2RaySVGCont.clientHeight) - trigTravelData[0][0];
    Ray_TL_Start.x = ((s2RaySVGCont.clientWidth / 2) - (S2_Halos_Width / 2)) + extHalosOpaqueShellOffset;
    Ray_TL_Start.y = (s2RaySVGCont.clientHeight) - trigTravelData[0][0];


    Ray_CP1_Start.x = (S2_Halos_Width / 4); Ray_CP1_Start.y = ((s2RaySVGCont.clientHeight) - trigTravelData[0][0]) + (S2_Halos_Height / 2);
    Ray_CP2_Start.x = (S2_Halos_Width / 4) * 3; Ray_CP2_Start.y = ((s2RaySVGCont.clientHeight) - trigTravelData[0][0]) + (S2_Halos_Height / 2);


    let startRayString = createRayString_OneControlPoint(Ray_BL_Start, Ray_BR_Start, Ray_TR_Start, Ray_TL_Start, Ray_CP1_Start);

    //creating new svg points for End stage
    let Ray_BL_End = s2RaySVGCont.createSVGPoint();
    Ray_BL_End.x = ((s2RaySVGCont.clientWidth) / 2) - 2; Ray_BL_End.y = s2RaySVGCont.clientHeight;

    let Ray_BR_End = s2RaySVGCont.createSVGPoint();
    Ray_BR_End.x = ((s2RaySVGCont.clientWidth) / 2) + 2; Ray_BR_End.y = s2RaySVGCont.clientHeight;

    let Ray_TR_End = s2RaySVGCont.createSVGPoint();
    Ray_TR_End.x = ((s2RaySVGCont.clientWidth / 2) + (S2_Halos_Width / 2)) - extHalosOpaqueShellOffset;
    Ray_TR_End.y = (s2RaySVGCont.clientHeight) - trigTravelData[0][1];

    let Ray_TL_End = s2RaySVGCont.createSVGPoint();
    Ray_TL_End.x = ((s2RaySVGCont.clientWidth / 2) - (S2_Halos_Width / 2)) + extHalosOpaqueShellOffset;
     Ray_TL_End.y = (s2RaySVGCont.clientHeight) - trigTravelData[0][1];


    let Ray_CP1_End = s2RaySVGCont.createSVGPoint();
    Ray_CP1_End.x = ((s2RaySVGCont.clientWidth / 2) - (S2_Halos_Width / 4)) + extHalosOpaqueShellOffset;
    Ray_CP1_End.y = ((s2RaySVGCont.clientHeight) - trigTravelData[0][1]) + (S2_Halos_Height / 2);

    let Ray_CP2_End = s2RaySVGCont.createSVGPoint();
    Ray_CP2_End.x = ((s2RaySVGCont.clientWidth / 2) + ((S2_Halos_Width / 4) * 3)) - extHalosOpaqueShellOffset;
    Ray_CP2_End.y = ((s2RaySVGCont.clientHeight) - trigTravelData[0][1]) + (S2_Halos_Height / 2);

    //setting the stage2End Coords by REASSIGNING EXISTING VARS (remember we are working upside down so we need to factor in the container's height)
    let endRayString = createRayString_OneControlPoint(Ray_BL_End, Ray_BR_End, Ray_TR_End, Ray_TL_End, Ray_CP1_End);



    //Setting the oneStage Animation
    let s2RayAnimateTag1 = document.querySelector("#spotlight2RayPath2_AnimTag_Stage1");
    s2RayAnimateTag1.setAttribute("repeatCount", "1");
    s2RayAnimateTag1.setAttribute("calcMode", "linear");
    //  s1RayAnimateTag1.setAttribute("d", startPosRayString);
    //s2RayAnimateTag1.setAttribute("begin", 0 + "s");
    s2RayAnimateTag1.setAttribute("from", startRayString);
    s2RayAnimateTag1.setAttribute("to", endRayString);
    s2RayAnimateTag1.setAttribute("dur", flexingData[0] + "s");
    s2RayAnimateTag1.setAttribute("fill", "freeze");
    s2RayAnimateTag1.setAttribute("restart", "always");
    s2RayAnimateTag1.beginElement();


















}


function triggerSweepAndRotateForExtHalos_S1_OneStage(startCoords, destCoords, trigTravelModelData_S1_OneStage, sweepTime) {

    let startRO = trigTravelModelData_S1_OneStage[1][0];
    let destRO = trigTravelModelData_S1_OneStage[1][1];



    triggerSweepAndRotateForHBLRG_OneStage_S1_CSSTrigger(startCoords, destCoords, startRO, destRO, sweepTime);

    triggerSweepAndRotateForClipPath_OneStage_S1_CSSTrigger(startCoords, destCoords, startRO, destRO, sweepTime);


    function triggerSweepAndRotateForHBLRG_OneStage_S1_CSSTrigger(startCoords, destCoords, startRO, destRO, sweepTime) {


        //we need to compensate for its current position in the DOM and subtract those offset pixels.
        let totalLeftOffset_PX = calcTotalLeftPXOffsetOfNestedElement("#spotlight1HBLLinkedRadGradContainer");
        let totalTopOffset_PX = calcTotalTopPXOffsetOfNestedElement("#spotlight1HBLLinkedRadGradContainer");

        //The pixel values we assign to the HBL_RG will start from its parent's position. So we need to subtract that out so that it will be relative to the entire HBI
        let topOffsetByImmediateContainerTop = calcTopOffsetByImmediateContainer("#spotlight1HBLLinkedRadGradContainer");
        let leftOffsetByImmediateContainerLeft = calcLeftOffsetByImmediateContainer("#spotlight1HBLLinkedRadGradContainer");

        //subtracting the offset that is caused by the parent node
        startCoords[0] = startCoords[0] - leftOffsetByImmediateContainerLeft;
        startCoords[1] = startCoords[1] - topOffsetByImmediateContainerTop;

        destCoords[0] = destCoords[0] - leftOffsetByImmediateContainerLeft;
        destCoords[1] = destCoords[1] - topOffsetByImmediateContainerTop;



        //And now finally implementing the final offsets (half the width and half the height)
        let cptOffsetX = S1_Halos_Width / 2;
        let cptOffsetyY = S1_Halos_Height / 2;

        //test point: Make sure after this point that the center of the halo is aligning with the StartPos, pointDPos and DestPos square pointers.
        startCoords[0] = startCoords[0] - cptOffsetX;
        startCoords[1] = startCoords[1] - cptOffsetyY;
        destCoords[0] = destCoords[0] - cptOffsetX;
        destCoords[1] = destCoords[1] - cptOffsetyY;

        let xDiff = destCoords[0] - startCoords[0];
        let yDiff = destCoords[1] - startCoords[1];


        //Update CSS variables
        root.style.setProperty('--S1_HBL_RG_CurrX', (startCoords[0] + "px"));
        root.style.setProperty('--S1_HBL_RG_CurrY', (startCoords[1] + "px"));

        root.style.setProperty('--S1_HBL_RG_DestX', (destCoords[0] + "px"));
        root.style.setProperty('--S1_HBL_RG_DestY', (destCoords[1] + "px"));

        root.style.setProperty('--S1_HBL_RG_StartRO', (startRO + "rad"));
        root.style.setProperty('--S1_HBL_RG_DestRO', (destRO + "rad"));

        root.style.setProperty('--S1_HBL_RG_XDiff', (xDiff + "px"));
        root.style.setProperty('--S1_HBL_RG_YDiff', (yDiff + "px"));

        root.style.setProperty('--S1_SweepTime', (sweepTime + "s"));

        let S1_HBLRG = document.querySelector("#spotlight1HBLLinkedRadGradContainer");
        S1_HBLRG.classList.toggle("spotlight1HBLLinkedRadGradContainer_Moving");



    }

    function triggerSweepAndRotateForClipPath_OneStage_S1_CSSTrigger(startCoords, destCoords, startRO, destRO, sweepTime){

        let s1ClipPathCircle = document.getElementById("spotlight1ClipPath");
        let ClipPathSVGCont = document.getElementById("spotlightClipPathsSVGBoundingBox");

        //we won't render this we will just use it as the reference for the clip path's coordinate
        let startPoint = ClipPathSVGCont.createSVGPoint();
        let destPoint = ClipPathSVGCont.createSVGPoint();

        let startPivot = ClipPathSVGCont.createSVGPoint();
        let destPivot = ClipPathSVGCont.createSVGPoint();

        let cptOffsetX = S1_Halos_Width / 2;
        let cptOffsetyY = S1_Halos_Height / 2;




        startPoint.x = startCoords[0] + (0);
        startPoint.y = startCoords[1] + (0);

        destPoint.x = destCoords[0] + (0);
        destPoint.y = destCoords[1] + (0);



        startPivot.x = startCoords[0] + (cptOffsetX);
        startPivot.y = startCoords[1] + (cptOffsetyY);

        destPivot.x = destCoords[0] + (cptOffsetX);
        destPivot.y = destCoords[1] + (cptOffsetyY);


        let startPointConverted = startPoint.matrixTransform( ClipPathSVGCont.getCTM().inverse() );
        let destPointConverted = destPoint.matrixTransform(ClipPathSVGCont.getCTM().inverse());



        //dividing the halos by 2 because we are setting radius not diameter
        s1ClipPathCircle.setAttribute("rx", (S1_Halos_Width / 2)-0);
        s1ClipPathCircle.setAttribute("ry", (S1_Halos_Height / 2)-0);


        //dealing with the animation

        //Dealing with translation
        let animTagX = document.querySelector("#spotlight1ClipPath_AnimTagX");
        animTagX.setAttribute("repeatCount", "1");
        animTagX.setAttribute("attributeName", "cx");
        animTagX.setAttribute("calcMode", "linear");
        animTagX.setAttribute("from", startPoint.x + S1_Halos_Width / 2);
        animTagX.setAttribute("to", destPoint.x + S1_Halos_Width / 2);
        animTagX.setAttribute("dur", sweepTime + "s");
        animTagX.setAttribute("fill", "freeze");
        animTagX.beginElement();

        /**SETTING THE RESTART FUNCTIONALITY HERE */
        animTagX.addEventListener("endEvent", globalRestartListener);

        let animTagY = document.querySelector("#spotlight1ClipPath_AnimTagY");
        animTagY.setAttribute("repeatCount", "1");
        animTagY.setAttribute("attributeName", "cy");
        animTagY.setAttribute("calcMode", "linear");
        animTagY.setAttribute("from", startPoint.y + S1_Halos_Height / 2);
        animTagY.setAttribute("to", destPoint.y + S1_Halos_Height / 2);
        animTagY.setAttribute("dur", sweepTime + "s");
        animTagY.setAttribute("fill", "freeze");
        animTagY.beginElement();


        /**
        //dealing with rotation
        let animTagRotate = document.querySelector("#spotlight1ClipPath_AnimTransformTagRotate");
        animTagRotate.setAttribute("repeatCount", "1");
       // animTagRotate.setAttribute("attributeName", "y");
        animTagRotate.setAttribute("calcMode", "linear");
        animTagRotate.setAttribute("from", (startRO * (180 / Math.PI)) + " " + startPivot.x + " " + startPivot.y);
        animTagRotate.setAttribute("to", (destRO * (180 / Math.PI)) + " " + destPivot.x + " " + destPivot.y);
        animTagRotate.setAttribute("dur", sweepTime + "s");
        */

    }



}

function triggerSweepAndRotateForExtHalos_S2_OneStage(startCoords, destCoords, trigTravelModelData_S2_OneStage, sweepTime){

    let startRO = trigTravelModelData_S2_OneStage[1][0];
    let destRO = trigTravelModelData_S2_OneStage[1][1];

    triggerSweepAndRotateForHBLRG_OneStage_S2_CSSTrigger(startCoords, destCoords, startRO, destRO, sweepTime);

    triggerSweepAndRotateForClipPath_OneStage_S2_CSSTrigger(startCoords, destCoords, startRO, destRO, sweepTime);

    function triggerSweepAndRotateForHBLRG_OneStage_S2_CSSTrigger(startCoords, destCoords, startRO, destRO, sweepTime){

        //we need to compensate for its current position in the DOM and subtract those offset pixels.
        let totalLeftOffset_PX = calcTotalLeftPXOffsetOfNestedElement("#spotlight2HBLLinkedRadGradContainer");
        let totalTopOffset_PX = calcTotalTopPXOffsetOfNestedElement("#spotlight2HBLLinkedRadGradContainer");

        //The pixel values we assign to the HBL_RG will start from its parent's position. So we need to subtract that out so that it will be relative to the entire HBI
        let topOffsetByImmediateContainerTop = calcTopOffsetByImmediateContainer("#spotlight2HBLLinkedRadGradContainer");
        let leftOffsetByImmediateContainerLeft = calcLeftOffsetByImmediateContainer("#spotlight2HBLLinkedRadGradContainer");

        //subtracting the offset that is caused by the parent node
        startCoords[0] = startCoords[0] - leftOffsetByImmediateContainerLeft;
        startCoords[1] = startCoords[1] - topOffsetByImmediateContainerTop;

        destCoords[0] = destCoords[0] - leftOffsetByImmediateContainerLeft;
        destCoords[1] = destCoords[1] - topOffsetByImmediateContainerTop;

        //And now finally implementing the final offsets (half the width and half the height)
        let cptOffsetX = S2_Halos_Width / 2;
        let cptOffsetyY = S2_Halos_Height / 2;

        //test point: Make sure after this point that the center of the halo is aligning with the StartPos, pointDPos and DestPos square pointers.
        startCoords[0] = startCoords[0] - cptOffsetX;
        startCoords[1] = startCoords[1] - cptOffsetyY;
        destCoords[0] = destCoords[0] - cptOffsetX;
        destCoords[1] = destCoords[1] - cptOffsetyY;


        let xDiff = destCoords[0] - startCoords[0];
        let yDiff = destCoords[1] - startCoords[1];

        //Update CSS variables
        root.style.setProperty('--S2_HBL_RG_CurrX', (startCoords[0] + "px"));
        root.style.setProperty('--S2_HBL_RG_CurrY', (startCoords[1] + "px"));

        root.style.setProperty('--S2_HBL_RG_DestX', (destCoords[0] + "px"));
        root.style.setProperty('--S2_HBL_RG_DestY', (destCoords[1] + "px"));

        root.style.setProperty('--S2_HBL_RG_StartRO', (startRO + "rad"));
        root.style.setProperty('--S2_HBL_RG_DestRO', (destRO + "rad"));

        root.style.setProperty('--S2_HBL_RG_XDiff', (xDiff + "px"));
        root.style.setProperty('--S2_HBL_RG_YDiff', (yDiff + "px"));

        root.style.setProperty('--S2_SweepTime', (sweepTime + "s"));

        let S2_HBLRG = document.querySelector("#spotlight2HBLLinkedRadGradContainer");
        S2_HBLRG.classList.toggle("spotlight2HBLLinkedRadGradContainer_Moving");



    }

    function triggerSweepAndRotateForClipPath_OneStage_S2_CSSTrigger(startCoords, destCoords, startRO, destRO, sweepTime){

        let s2ClipPathCircle = document.getElementById("spotlight2ClipPath");
        let ClipPathSVGCont = document.getElementById("spotlightClipPathsSVGBoundingBox");

        //we won't render this we will just use it as the reference for the clip path's coordinate
        let startPoint = ClipPathSVGCont.createSVGPoint();
        let destPoint = ClipPathSVGCont.createSVGPoint();

        let startPivot = ClipPathSVGCont.createSVGPoint();
        let destPivot = ClipPathSVGCont.createSVGPoint();

        let cptOffsetX = S2_Halos_Width / 2;
        let cptOffsetyY = S2_Halos_Height / 2;

        startPoint.x = startCoords[0] + (0);
        startPoint.y = startCoords[1] + (0);

        destPoint.x = destCoords[0] + (0);
        destPoint.y = destCoords[1] + (0);

        startPivot.x = startCoords[0] + (cptOffsetX);
        startPivot.y = startCoords[1] + (cptOffsetyY);

        destPivot.x = destCoords[0] + (cptOffsetX);
        destPivot.y = destCoords[1] + (cptOffsetyY);


        //dividing the halos by 2 because we are setting radius not diameter
        //Note: I find that for S2, dividing by 2.5 produces a more accurate overlap of the clip path with the halos
        s2ClipPathCircle.setAttribute("rx", S2_Halos_Width / 2.5);
        s2ClipPathCircle.setAttribute("ry", S2_Halos_Height / 2.5);

        //Dealing with translation
        let animTagX = document.querySelector("#spotlight2ClipPath_AnimTagX");
        animTagX.setAttribute("repeatCount", "1");
        animTagX.setAttribute("attributeName", "cx");
        animTagX.setAttribute("calcMode", "linear");
        animTagX.setAttribute("from", startPoint.x + S2_Halos_Width / 2);
        animTagX.setAttribute("to", destPoint.x + S2_Halos_Width / 2);
        animTagX.setAttribute("dur", sweepTime + "s");
        animTagX.setAttribute("fill", "freeze")
        animTagX.beginElement();

        let animTagY = document.querySelector("#spotlight2ClipPath_AnimTagY");
        animTagY.setAttribute("repeatCount", "1");
        animTagY.setAttribute("attributeName", "cy");
        animTagY.setAttribute("calcMode", "linear");
        animTagY.setAttribute("from", startPoint.y + S2_Halos_Height / 2);
        animTagY.setAttribute("to", destPoint.y + S2_Halos_Height / 2);
        animTagY.setAttribute("dur", sweepTime + "s");
        animTagY.setAttribute("fill", "freeze");
        animTagY.beginElement();










    }

}

function triggerContAcceleration_OneStage_S1_CSSTrigger(s1ContTrigAccelerationData_OneStage, trigTravelModelData_OneStage){

    let startRO = trigTravelModelData_OneStage[1][0];
    let destRO = trigTravelModelData_OneStage[1][1];

    let Dur = s1ContTrigAccelerationData_OneStage[0];
    let BezierConfig = s1ContTrigAccelerationData_OneStage[1];

    root.style.setProperty('--S1_Cont_OneStage_StartRO', startRO + "rad");
    root.style.setProperty('--S1_Cont_OneStage_EndRO', destRO + "rad");
    root.style.setProperty('--S1_Cont_OneStage_Dur', Dur + "s");
    root.style.setProperty('--S1_Cont_OneStage_CubicBezierConfig', BezierConfig);

    let S1_Cont = document.querySelector("#spotlight1Container");
    S1_Cont.classList.toggle("spotlight1ContainerTrig_OneStage_Moving");




}


function triggerContAcceleration_OneStage_S2_CSSTrigger(s2ContTrigAccelerationData_OneStage, trigTravelModelData_OneStage){

    let startRO = trigTravelModelData_OneStage[1][0];
    let destRO = trigTravelModelData_OneStage[1][1];

    let Dur = s2ContTrigAccelerationData_OneStage[0];
    let BezierConfig = s2ContTrigAccelerationData_OneStage[1];

    root.style.setProperty('--S2_Cont_OneStage_StartRO', startRO + "rad");
    root.style.setProperty('--S2_Cont_OneStage_EndRO', destRO + "rad");
    root.style.setProperty('--S2_Cont_OneStage_Dur', Dur + "s");
    root.style.setProperty('--S2_Cont_OneStage_CubicBezierConfig', BezierConfig);

    let S1_Cont = document.querySelector("#spotlight2Container");
    S1_Cont.classList.toggle("spotlight2ContainerTrig_OneStage_Moving");


}



function triggerContAcceleration_TwoStage_S1_CSSTrigger(s1ContTrigAccelerationData, trigTravelModelData){

    let startRO = trigTravelModelData[1][0];
    let pointDRO = trigTravelModelData[1][1];
    let destRO = trigTravelModelData[1][2];

    let stage1Dur = s1ContTrigAccelerationData[0];
    let stage1BezierConfig = s1ContTrigAccelerationData[1];

    let stage2Dur = s1ContTrigAccelerationData[2];
    let stage2BezierConfig = s1ContTrigAccelerationData[3];



    root.style.setProperty('--S1_Cont_Part1_StartRO', startRO + "rad");
    root.style.setProperty('--S1_Cont_Part1_EndRO', pointDRO + "rad");
    root.style.setProperty('--S1_Cont_Part1_Dur', stage1Dur + "s");
    root.style.setProperty('--S1_Cont_Part1_CubicBezierConfig', stage1BezierConfig);

    root.style.setProperty('--S1_Cont_Part2_StartRO', pointDRO + "rad");
    root.style.setProperty('--S1_Cont_Part2_EndRO', destRO + "rad");
    root.style.setProperty('--S1_Cont_Part2_Dur', stage2Dur + "s");
    root.style.setProperty('--S1_Cont_Part2_CubicBezierConfig', stage2BezierConfig);

   // console.log("stage1Bezier: " + stage1BezierConfig);
    //console.log("stage2Bezier: " + stage2BezierConfig);
    let S1_Cont = document.querySelector("#spotlight1Container");
    S1_Cont.classList.toggle("spotlight1ContainerTrig_Part1Moving");



}

function triggerContAcceleration_TwoStage_S2_CSSTrigger(s2ContTrigAccelerationData, trigTravelModelData){

    let startRO = trigTravelModelData[1][0];

    let pointDRO = trigTravelModelData[1][1];

    let destRO = trigTravelModelData[1][2];



    let stage1Dur = s2ContTrigAccelerationData[0];
    let stage1BezierConfig = s2ContTrigAccelerationData[1];

    let stage2Dur = s2ContTrigAccelerationData[2];
    let stage2BezierConfig = s2ContTrigAccelerationData[3];

    root.style.setProperty('--S2_Cont_Part1_StartRO', startRO + "rad");
    root.style.setProperty('--S2_Cont_Part1_EndRO', pointDRO + "rad");
    root.style.setProperty('--S2_Cont_Part1_Dur', stage1Dur + "s");
    root.style.setProperty('--S2_Cont_Part1_CubicBezierConfig', stage1BezierConfig);

    root.style.setProperty('--S2_Cont_Part2_StartRO', pointDRO + "rad");
    root.style.setProperty('--S2_Cont_Part2_EndRO', destRO + "rad");
    root.style.setProperty('--S2_Cont_Part2_Dur', stage2Dur + "s");
    root.style.setProperty('--S2_Cont_Part2_CubicBezierConfig', stage2BezierConfig);

    let S2_Cont = document.querySelector("#spotlight2Container");
    S2_Cont.classList.toggle("spotlight2ContainerTrig_Part1Moving");


    console.log("getting css var: --S1_Cont_Part2_StartRO: " + root.style.getPropertyValue('--S1_Cont_Part2_StartRO'));


}


function triggerContRGFlexing_OneStage_S1_CSSTrigger(s1ContRGFlexingData_OneStage, trigTravelModelData_OneStage){

    let StartRadius = trigTravelModelData_OneStage[0][0];
    let EndRadius = trigTravelModelData_OneStage[0][1];

    let Dur = s1ContRGFlexingData_OneStage[0];
    let BezierConfig = s1ContRGFlexingData_OneStage[1];

    //stage 2. displacing by the center of cpt
    StartRadius = StartRadius - (S1_Halos_Height / 2);
    EndRadius = EndRadius - (S1_Halos_Height / 2);


    root.style.setProperty('--S1_Cont_RG_TrigVersion_OneStage_StartRad', StartRadius + "px");
    root.style.setProperty('--S1_Cont_RG_TrigVersion_OneStage_EndRad', EndRadius + "px");
    root.style.setProperty('--S1_Cont_RG_TrigVersion_OneStage_Dur', Dur + "s");
    root.style.setProperty('--S1_Cont_RG_TrigVersion_OneStage_BezierConfig', BezierConfig);

    let S1_Cont_rg = document.querySelector("#spotlight1NativeRadGradContainer");
    S1_Cont_rg.classList.toggle("spotlight1NativeRadGradContainer_moving_oneStage");



}

function triggerContRGFlexing_OneStage_S2_CSSTrigger(s2ContRGFlexingData_OneStage, trigTravelModelData_OneStage){

    let StartRadius = trigTravelModelData_OneStage[0][0];
    let EndRadius = trigTravelModelData_OneStage[0][1];

    let Dur = s2ContRGFlexingData_OneStage[0];
    let BezierConfig = s2ContRGFlexingData_OneStage[1];

    //stage 2. displacing by the center of cpt
    StartRadius = StartRadius - (S2_Halos_Height / 2);
    EndRadius = EndRadius - (S2_Halos_Height / 2);

    root.style.setProperty('--S2_Cont_RG_TrigVersion_OneStage_StartRad', StartRadius + "px");
    root.style.setProperty('--S2_Cont_RG_TrigVersion_OneStage_EndRad', EndRadius + "px");
    root.style.setProperty('--S2_Cont_RG_TrigVersion_OneStage_Dur', Dur + "s");
    root.style.setProperty('--S2_Cont_RG_TrigVersion_OneStage_BezierConfig', BezierConfig);

    let S1_Cont_rg = document.querySelector("#spotlight2NativeRadGradContainer");
    S1_Cont_rg.classList.toggle("spotlight2NativeRadGradContainer_moving_oneStage");







}

function triggerContRGFlexing_TwoStage_S2_CSSTrigger(s1ContRGFlexingData, trigTravelModelData){

    let stage1StartRadius = trigTravelModelData[0][0];
    let stage1EndRadius = trigTravelModelData[0][1];
    let stage2EndRadius = trigTravelModelData[0][2];

    let stage1Dur = s1ContRGFlexingData[0];
    let stage1BezierConfig = s1ContRGFlexingData[1];

    let stage2Dur = s1ContRGFlexingData[2];
    let stage2BezierConfig = s1ContRGFlexingData[3];

    //stage 2. displacing by the center of cpt
    stage1StartRadius = stage1StartRadius - (S2_Halos_Height / 2);
    stage1EndRadius = stage1EndRadius - (S2_Halos_Height / 2);
    stage2EndRadius = stage2EndRadius - (S2_Halos_Height / 2);

    root.style.setProperty('--S2_Cont_RG_TrigVersion_Stage1StartRad', stage1StartRadius + "px");
    root.style.setProperty('--S2_Cont_RG_TrigVersion_Stage1EndRad', stage1EndRadius + "px");
    root.style.setProperty('--S2_Cont_RG_TrigVersion_Stage1Dur', stage1Dur + "s");
    root.style.setProperty('--S2_Cont_RG_TrigVersion_Stage1BezierConfig', stage1BezierConfig);

    root.style.setProperty('--S2_Cont_RG_TrigVersion_Stage2StartRad', stage1EndRadius + "px");
    root.style.setProperty('--S2_Cont_RG_TrigVersion_Stage2EndRad', stage2EndRadius + "px");
    root.style.setProperty('--S2_Cont_RG_TrigVersion_Stage2Dur', stage2Dur + "s");
    root.style.setProperty('--S2_Cont_RG_TrigVersion_Stage2BezierConfig', stage2BezierConfig);

    let S2_Cont_rg = document.querySelector("#spotlight2NativeRadGradContainer");
    S2_Cont_rg.classList.toggle("spotlight2NativeRadGradContainer_moving");


}


function triggerContRGFlexing_TwoStage_S1_CSSTrigger(s1ContRGFlexingData, trigTravelModelData){

    let stage1StartRadius = trigTravelModelData[0][0];
    let stage1EndRadius = trigTravelModelData[0][1];
    let stage2EndRadius = trigTravelModelData[0][2];

    let stage1Dur = s1ContRGFlexingData[0];
    let stage1BezierConfig = s1ContRGFlexingData[1];

    let stage2Dur = s1ContRGFlexingData[2];
    let stage2BezierConfig = s1ContRGFlexingData[3];


    //stage 2. displacing by the center of cpt
    stage1StartRadius = stage1StartRadius - (S1_Halos_Height /2);
    stage1EndRadius = stage1EndRadius - (S1_Halos_Height/2);
    stage2EndRadius = stage2EndRadius - (S1_Halos_Height/2);

    root.style.setProperty('--S1_Cont_RG_TrigVersion_Stage1StartRad', stage1StartRadius + "px");
    root.style.setProperty('--S1_Cont_RG_TrigVersion_Stage1EndRad', stage1EndRadius + "px");
    root.style.setProperty('--S1_Cont_RG_TrigVersion_Stage1Dur', stage1Dur + "s");
    root.style.setProperty('--S1_Cont_RG_TrigVersion_Stage1BezierConfig', stage1BezierConfig);

    root.style.setProperty('--S1_Cont_RG_TrigVersion_Stage2StartRad', stage1EndRadius + "px");
    root.style.setProperty('--S1_Cont_RG_TrigVersion_Stage2EndRad', stage2EndRadius + "px");
    root.style.setProperty('--S1_Cont_RG_TrigVersion_Stage2Dur', stage2Dur + "s");
    root.style.setProperty('--S1_Cont_RG_TrigVersion_Stage2BezierConfig', stage2BezierConfig);



    let S1_Cont_rg = document.querySelector("#spotlight1NativeRadGradContainer");
    S1_Cont_rg.classList.toggle("spotlight1NativeRadGradContainer_moving");







}



//----END OF CSS Funcs-------







//--------START OF MAINTENENCE FUNCS-------------
//Will read the pixel dimenions of the halos and update the global variables for that.
function initializeDimensionsOfHalos() {

    S1_Halos_Width = document.getElementById("spotlight1HBLLinkedRadGradContainer").getBoundingClientRect().width;
    S1_Halos_Height = document.getElementById("spotlight1HBLLinkedRadGradContainer").getBoundingClientRect().height;

    S2_Halos_Width = document.getElementById("spotlight2HBLLinkedRadGradContainer").getBoundingClientRect().width;
    S2_Halos_Height = document.getElementById("spotlight2HBLLinkedRadGradContainer").getBoundingClientRect().height;
}

//Will get the pixel coordinates of the borders of the HBI and update the global variable, pxRangeOfHBI.
function updatePXRangeOfHBI() {

    //IMPORTANT: Make sure you designate only the logo area for generating coords. Do not designate the entire Page
    let hbi = document.getElementById("HomeBaseTestSvgCONTAINER");

    //adding window.scrollX to compensate for any scrolls and get the element position relative to the entire document regardless of scroll position
    //also subtracting 50 from the right and bottom edges just to make a nice margin
    pxRangeOfHBI[0][0] = (hbi.getBoundingClientRect().left + window.scrollX);
    pxRangeOfHBI[0][1] = (hbi.getBoundingClientRect().right + window.scrollX) - 50;

    pxRangeOfHBI[1][0] = (hbi.getBoundingClientRect().top + window.scrollY);


    //Note: For the bottom edge of the range, we cannot use the actual position of the HBI because it extends way below the spotlightPanel so our trigs functions won't work. So we need to use the spotlight panel to define the limit of the Y-axis range
    let spotlightPanel = document.getElementById("hbi_spotlightPanel");

    pxRangeOfHBI[1][1] = (spotlightPanel.getBoundingClientRect().top) - 50;



}


//Will calculate the left offset (in pixels) of an element by summing up the offset of all its parents.
function calcTotalLeftPXOffsetOfNestedElement(elementName){

    let totalLeftOffset = 0;

    let element = document.querySelector(elementName);

    let currElement = element;

    while (currElement.parentElement){

        totalLeftOffset = totalLeftOffset + currElement.offsetLeft;
        currElement = currElement.parentElement;


    }

    return totalLeftOffset;



}


function calcTotalTopPXOffsetOfNestedElement(elementName){

    let totalTopOffset = 0;

    let element = document.querySelector(elementName);

    let currElement = element;

    while (currElement.parentElement) {

        totalTopOffset = totalTopOffset + currElement.offsetTop;
        currElement = currElement.parentElement;


    }

    return totalTopOffset;




}

function calcLeftOffsetByImmediateContainer(elementName){
    let element = document.querySelector(elementName);

    let parentLeft = (element.parentElement.getBoundingClientRect().left) + window.scrollX;

    return parentLeft;

}


function calcTopOffsetByImmediateContainer(elementName){

    let element = document.querySelector(elementName);

    let parentTop = (element.parentElement.getBoundingClientRect().top) + window.scrollY;

    return parentTop;


}


//This will check the trajectory model type (whether its oneStage or twoStage). This must work for both spotlights so keep orientation in mind
function checkTrajectoryModelType(startCoords, destCoords, axisSourceCoords){

    //Conditions: For the trajectory to be One stage, it must contain an obtuse angle WHICH IS NOT formed at the axisSourceCoords

    // To Do: Check the angle and determine trajectory type.


    let destCoords_to_AxisSrc = getRadius([ destCoords[0], destCoords[1] ], [ axisSourceCoords[0], axisSourceCoords[1] ]);
    let destCoord_to_StartCoords = getRadius( [ startCoords[0], startCoords[1]], [ destCoords[0], destCoords[1] ] );
    let axisSourceCoords_to_startCoords = getRadius( [startCoords[0], startCoords[1]], [ axisSourceCoords[0], axisSourceCoords[1] ] );

     //Stage 1: Calcing angle at destCoords Point (using  law of cosines)
    //Rough Calc below
    // Math.acos(( (destCoord_to_AxisSrc)^2 + (dest_to_Start)^2 - (axisSrc_to_StartCoords)^2 ) / (2* (axisSrc_to_DestCoords) * (destCoord_to_StartCoords)) )
    //actual code calc
    let destCoordPointAngle = Math.acos((Math.pow(destCoords_to_AxisSrc, 2) + Math.pow(destCoord_to_StartCoords, 2) - Math.pow(axisSourceCoords_to_startCoords, 2) ) / (2 * destCoords_to_AxisSrc * destCoord_to_StartCoords));


    //Stage 2: calcing angle at startCoords Point
    //rough calc below
    // Math.acos(  ( (startCoord_to_DestCoord)^2 + (startCoord_to_AxisCoord)^2 - (axisCoord_to_DestCoord)^2 ) / ( 2 * axisCoord_to_startCoord * startCoord_to_DestCoord ) )

    let startCoordsPointAngle = Math.acos( (Math.pow(destCoord_to_StartCoords, 2) + Math.pow(axisSourceCoords_to_startCoords, 2) - Math.pow(destCoords_to_AxisSrc, 2) ) / (2 * axisSourceCoords_to_startCoords * destCoord_to_StartCoords) );

    //stage 3: now check if any the angles (startCoordsPointAngle or destCoordsPointAngle are obtuse)
    let trajectoryType = "TwoStage";

    if(destCoordPointAngle > (Math.PI/2)){
        trajectoryType = "OneStage";
    }

    if(startCoordsPointAngle > (Math.PI/2)){
        trajectoryType = "OneStage";
    }

    //trajectoryType = "OneStage";


    return trajectoryType;

}


//will take in the names (S1 or S2) of either spotlight and then calc the px amount of the black shell that is created by the opaque part of the radgrad.
function calcExtHalosOpaqueShellOffset(SX){

    let HBL_RG; let Cont_RG;

    if(SX == "S1"){

        HBL_RG = document.getElementById("spotlight1HBLLinkedRadGradContainer");
        Cont_RG = document.getElementById("spotlight1NativeRadGradContainer");
    }

    else if(SX == "S2"){
        HBL_RG = document.getElementById("spotlight2HBLLinkedRadGradContainer");
        Cont_RG = document.getElementById("spotlight2NativeRadGradContainer");
    }


    let HBL_RGConfig = window.getComputedStyle(HBL_RG).background;
    let Cont_RGConfig = window.getComputedStyle(Cont_RG).background;

    let offsetArr = extractRGCheckpointsBackwardsVersion(HBL_RGConfig);
    let lastOffset = offsetArr[3];

    //the opaque part is 100 - lastOffset 
    //console.log("lastOffset: "+ lastOffset);
    let opaqueShellOffset = (1/(100 - lastOffset)) * document.getElementById("spotlight1HBLLinkedRadGradContainer").getBoundingClientRect().width;

    return opaqueShellOffset;

    console.log("RG Config Offest Array: " + offsetArr);


   // console.log("RGConfig Gotten from CSS: " + HBL_RGConfig);
   // console.log("Cont_RGConfig " + Cont_RGConfig);


    //NOTE: THIS FUNC DOES AN ENDLESS LOOP. NEEDS TO BE FIXED. DO NOT USEE.
    //This will take in the string of the radial-gradient configuration and return the values of the "borders" of the radial gradient in the form of an array.
    /** This will take in the string of the radial-gradient configuration and return the values of the "borders" of the radial gradient in the form of an array.
     * Note that the radial gradient configuration string returned by javascript has a slightly different format
     *  from how you declare it in the CSS file. It will look something like: rgba(0, 0, 0, 0) radial-gradient(at 50% 56%, rgba(255, 247, 20, 0.6) 0%, rgba(255, 247, 20, 0.6) 50%, rgba(255, 247, 20, 0.6) 60%, rgba(255, 247, 20, 0.6) 100%...)
     * You can see the Javascript returned configuration by console logging  window.getComputedStyle(Cont_RG).background in the browser.
     * The only values you are concerned with here are those percentage values that come after  rgba(255, 247, 20, 0.6)....which in the string above is - 0%, 50%, 60%, 100%
     * You just have to get the 2nd last border value (before 100) and use that with the computed PX width of the halo to find out what percentage of it is in the opaque part.
     */

    function extractRGCheckpoints(configString){

        let rgCheckpoints = [];

        let rgba_detected = false;

        //2 bool vals to indicate pass status of opening and closing brackets
        let postRgbaBracketsPassed = [false, false];

        let parsingForBorderr = false;

        for(let x=0; x<configString.length; x=x+1){

            if(configString[x]=='r' || configString[x]=='R'){
                rgba_detected = checkForRgba(configString, x);

                if(rgba_detected == true){

                    console.log("dete");

                    //start 4 index later (if the limit permits)
                    if((x+4) < (configString.length)){
                        x=x+4;
                    }

                    //skip over any whitespaces
                    while(configString[x]!='('){
                        x=x+1;
                    }

                    //find opening parenthesis
                    if(configString[x]=='('){
                        while(configString[x]!=')'){
                            x=x+1;
                        }
                    }

                    //skip over any whitespaces
                    while(configString[x]!=' '){
                        x=x+1;
                    }

                    //extract num
                    let borderNum = "";
                    while(configString[x]!='%'){
                        borderNum = borderNum + configString[x];
                    }

                    rgCheckpoints.push(borderNum);

                }
            }

        }

        return rgCheckpoints;

        //will take in a configString and an index, and check if 'rgba' can be found from that index onwards (remember to add a conditional to not go above length of config string)
        //Will return true if rgba is found, false otherwise
        function checkForRgba(configString, index){

            let isRgba = true;

            let targetString = "rgba";
            let targetIndex = 0;

            for(let x=index; x<index+4; x=x+1){

                if(targetString[targetIndex] != configString[x]){
                    isRgba = false;
                }
                targetIndex = targetIndex + 1;
            }

            return isRgba;

        }


    }


    //will traverse backwards through the radial gradient config and get the RG percentage values
    //the 4th index (index 3) is the value you're looking for
    function extractRGCheckpointsBackwardsVersion(configString){

        let arrOfOffsets = [];

        //If encounter %, read num until whitespace (backwards) and store
        for(let x=configString.length-1; x>=0; x=x-1){

          

            if(configString[x]=='%'){
                x=x-1;
                let numString = '';
                while(configString[x]!=' '){
                    numString = configString[x] + numString;
                    x=x-1;
                 
                }
                arrOfOffsets.push(numString);
                
            }


        }

        return arrOfOffsets;

    }








}

//--------END OF MAINTENENCE FUNCS-------------



//----------START OF SQUARE POINTER FUNCS---------

function activateStartPosSquarePointer(xPos, yPos) {

    let square = document.querySelector("#startPosSquarePointer");

    let leftString = xPos + "px";
    let topString = yPos + "px";

    root.style.setProperty('--StartPos_SQ_X', leftString);
    root.style.setProperty('--StartPos_SQ_Y', topString);

    square.classList.toggle("startPosSquarePointer_ACTIVE");
    console.log("activate startPos pointer active");
}

function activateDestPosSquarePointer(xPos, yPos){
    let square = document.querySelector("#destPosSquarePointer");

    let leftString = xPos + "px";
    let topString = yPos + "px";

    root.style.setProperty('--DestPos_SQ_X', leftString);
    root.style.setProperty('--DestPos_SQ_Y', topString);

    square.classList.toggle("destPosSquarePointer_ACTIVE");

}

function activatePointDPosSquarePointer(xPos, yPos) {
    let square = document.querySelector("#pointDPosSquarePointer");

    let leftString = xPos + "px";
    let topString = yPos + "px";

    root.style.setProperty('--PointDPos_SQ_X', leftString);
    root.style.setProperty('--PointDPos_SQ_Y', topString);

    square.classList.toggle("pointDPosSquarePointer_ACTIVE");

}


//-----------END OF SQUARE POINTER FUNCS---------

//--------------START OF RAY CONSTRUCTION FUNCS-------

//BLPoint = Bottom Left Point, CP1 = control point 1
//Will take in SVG points and construct a ray string with 1 control point (the control point is integrated into the path with a bezier curve)
function createRayString_OneControlPoint(BLPoint, BRPoint, TLPoint, TRPoint, CP1Point){

    let TR_X = TRPoint.x;
    let TR_Y = TRPoint.y;

    let BL_X = BLPoint.x;
    let BL_Y = BLPoint.y;

    let BR_X = BRPoint.x;
    let BR_Y = BRPoint.y;

    let TL_X = TLPoint.x;
    let TL_Y = TLPoint.y;

    let CP1_X = CP1Point.x;
    let CP1_Y = CP1Point.y;



    let rayString = "M" + TR_X + " " + TR_Y + "C" + TR_X + " " + TR_Y + " " + BL_X + " " + BL_Y + " " + BL_X + " " + BL_Y +
    " " + BL_X +  " " + BL_Y + " " + BR_X + " " + BR_Y + " " + BR_X + " " + BR_Y + " " + BR_X + " " + BR_Y + " " + TL_X + " " +
     TL_Y + " " + TL_X + " " + TL_Y + " Q " + CP1_X + " " + CP1_Y + " " + TR_X + " " + TR_Y + " Z";

        return rayString;
}



/**This is a variation of the createRayString function. The only difference is that you have 2 control points instead of 1. The reason why this was discontinued was because it was
 * difficult to model a smooth curve at the halo area of the curve.
 *
 */
function createRayString_TwoControlPoints(BLPoint, BRPoint, TLPoint, TRPoint, CP1Point, CP2Point){

    let RayTopRightXPos = TRPoint.x;
    let RayTopRightYPos = TRPoint.y;

    let RayBotLeftXPos = BLPoint.x;
    let RayBotLeftYPos = BLPoint.y;

    let RayBotRightXPos = BRPoint.x;
    let RayBotRightYPos = BRPoint.y;

    let RayTopLeftXPos = TLPoint.x;
    let RayTopLeftYPos = TLPoint.y;

    let RayFirstCPXPos = CP1Point.x;
    let RayFirstCPYPos = CP1Point.y;

    let RaySecondCPXPos = CP2Point.x;
    let RaySecondCPYPos = CP2Point.y;





    let rayString = "M" + RayTopRightXPos +
        ", " + RayTopRightYPos +
        "C" + RayTopRightXPos +
        ", " + RayTopRightYPos +
        " " + RayBotLeftXPos +
        ", " + RayBotLeftYPos +
        " " + RayBotLeftXPos +
        ", " + RayBotLeftYPos +
        " " + RayBotLeftXPos +
        ", " + RayBotLeftYPos +
        " " + RayBotRightXPos +
        ", " + RayBotRightYPos +
        " " + RayBotRightXPos +
        ", " + RayBotRightYPos +
        " " + RayBotRightXPos +
        ", " + RayBotRightYPos +
        " " + RayTopLeftXPos +
        ", " + RayTopLeftYPos +
        " " + RayTopLeftXPos +
        ", " + RayTopLeftYPos +
        " " + RayFirstCPXPos +
        ", " + RayFirstCPYPos +
        " " + RaySecondCPXPos +
        ", " + RaySecondCPYPos +
        " " + RayTopRightXPos +
        ", " + RayTopRightYPos + " Z";


    return rayString;

}


//----------END OF RAY CONSTRUCTION FUNCS-----------





//--------------START OF REAL TIME MOUSE TRACKING FUNCS-----------------




function angleSpotlightContsToMousePosition(currX, currY, mouseX, mouseY){

     //dealing with spotlight1
     //stage1: get current angle


     let spotlight1AxisSrcCoords = getAxisSourceCoords("spotlight1EmitterMock");
     let spotlight1AxisSrcX = spotlight1AxisSrcCoords[0]; let spotlight1AxisSrcY = spotlight1AxisSrcCoords[1];


    let startRO = getRO([currX, currY], [spotlight1AxisSrcX, spotlight1AxisSrcY]);

    //stage2: get angle of where the mouse pos is
    let mouseRO = getRO([mouseX, mouseY], [spotlight1AxisSrcX, spotlight1AxisSrcY]);

    console.log("startRO: " + startRO + " mouseRO: " + mouseRO);

    let spotlight1Cont = document.getElementById("spotlight1Container");




     let contAnimData = [{
          // transformorigin: "50% 100%",
         transform: "rotate(" + startRO + "rad)"
         },
         { transform: "rotate(" + mouseRO + "rad)" }
         ];

        let contAnimTimeData = {
            duration: 100,
            iterations: Infinity,
            fill:"none"
        };

       // let spotlight1Cont = document.getElementById("spotlight1Container");



         spotlight1Cont.animate(contAnimData, contAnimTimeData);






    //step 1: Get current angle of spotlights
    //angleSpotlight1ToMousePosition();

    //angleSpotlight2ToMousePosition();



    function angleSpotlight1ToMousePosition(event){

        //stage1: get current angle
        //1.1: Read the current coords of the HBL_RG And use that to calc the angle
        let extHaloX = document.getElementById("spotlight1HBLLinkedRadGradContainer").getBoundingClientRect().left;
        let extHaloY = document.getElementById("spotlight1HBLLinkedRadGradContainer").getBoundingClientRect().top;

        let spotlight1AxisSrcCoords = getAxisSourceCoords("spotlight1EmitterMock");
        let spotlight1AxisSrcX = spotlight1AxisSrcCoords[0]; let spotlight1AxisSrcY = spotlight1AxisSrcCoords[1];

        let startRO = getRO([extHaloX, extHaloY], [spotlight1AxisSrcX, spotlight1AxisSrcY]);


        //stage2: get angle of where the mouse pos is
        let mouseX = event.x;
        let mouseY = event.y;
        let mouseRO = getRO([mouseX, mouseY], [spotlight1AxisSrcX, spotlight1AxisSrcY]);


        let contAnimData = [{
            // transformorigin: "50% 100%",
            transform: "rotate(" + startRO + "rad)"
        },
            { transform: "rotate(" + mouseRO + "rad)" }
        ];

        let contAnimTimeData = {
            duration: 1000,
            iterations: 1
        };

        let spotlight1Cont = document.getElementById("spotlight1Container");

        spotlight1Cont.animate(contAnimData, contAnimTimeData);


    }

    function angleSpotlight2ToMousePosition(){

    }

}

//Will resume BOTH of the spotlight's anims (ext halos, cont and cont_rg)(to be called only after pauseSpotlightsAnims_CSSTrigger has been activated)
function resumeSpotlightsAnims_CSSTrigger(){

    //DEALING WITH S1

    //removing the pause class from the container
    //IMPROVED METHOD: JUST CLERAING THE ENTIRE CLASSLIST on all of the spotlight's elements to reset them so that the patrolLoop can orient them from scratch
    document.getElementById("spotlight1Container").className = "";
    document.getElementById("spotlight1Container").classList = [];

    document.getElementById("spotlight1NativeRadGradContainer").className = "";
    document.getElementById("spotlight1NativeRadGradContainer").classList = [];

    document.getElementById("spotlight1HBLLinkedRadGradContainer").className = "";
    document.getElementById("spotlight1HBLLinkedRadGradContainer").classList = [];

    console.log("current class after resume: " + document.getElementById("spotlight1Container").className);

  //  document.getElementById("spotlight1Container").setAttribute("id", "spotlight1Container");

    //now dealing with the ray. Just erase all the tag data after setting the class to null
    resumeS1Ray();

    resumeS1RayColors();

    resumeS1ClipPath();

   // document.getElementById("spotlight2Container").className = "";
    
    //Will clear everything out of the clip path out so that it can restart
    function resumeS1ClipPath(){
        let s1ClipPathCircle = document.getElementById("spotlight1ClipPath");

        s1ClipPathCircle.setAttribute("rx", "");
        s1ClipPathCircle.setAttribute("ry", "");

        let animTagX = document.querySelector("#spotlight1ClipPath_AnimTagX");
        animTagX.setAttribute("repeatCount", "");
        animTagX.setAttribute("attributeName", "");
        animTagX.setAttribute("calcMode", "");
        animTagX.setAttribute("from", "");
        animTagX.setAttribute("to", "");
        animTagX.setAttribute("dur", "");
        animTagX.setAttribute("fill", "");
       /* animTagX.setAttribute("end", ""); */
       //animTagX.endElement();

        let animTagY = document.querySelector("#spotlight1ClipPath_AnimTagY");
        animTagY.setAttribute("repeatCount", "");
        animTagY.setAttribute("attributeName", "");
        animTagY.setAttribute("calcMode", "");
        animTagY.setAttribute("from", "");
        animTagY.setAttribute("to", "");
        animTagY.setAttribute("dur", "");
        animTagY.setAttribute("fill", "");
       // animTagY.endElement();
       /* animTagY.setAttribute("end", ""); */
    }

    function resumeS1Ray() {
        let s1RaySVGCont = document.getElementById("spotlight1SVGBox");
        s1RaySVGCont.className = "";
        s1RaySVGCont.classList = [];
        let s1RayAnimateTag1 = document.querySelector("#spotlight1RayPath2_AnimTag_Stage1");
      //  s1RayAnimateTag1.endElement();
       // s1RayAnimateTag1.setAttribute("additive", "replace");
        s1RayAnimateTag1.setAttribute("repeatCount", "");
        s1RayAnimateTag1.setAttribute("calcMode", "");
        s1RayAnimateTag1.setAttribute("begin", "");
        s1RayAnimateTag1.setAttribute("from", "");
        s1RayAnimateTag1.setAttribute("to", "");
        s1RayAnimateTag1.setAttribute("dur", "");
        s1RayAnimateTag1.setAttribute("fill", "");
        s1RayAnimateTag1.setAttribute("restart", "");

        let s1RayAnimateTag2 = document.querySelector("#spotlight1RayPath2_AnimTag_Stage2");
      //  s1RayAnimateTag2.endElement();
       // s1RayAnimateTag2.setAttribute("additive", "replace");
        s1RayAnimateTag2.setAttribute("repeatCount", "");
        s1RayAnimateTag2.setAttribute("calcMode", "");
        s1RayAnimateTag2.setAttribute("begin", "");
        s1RayAnimateTag2.setAttribute("from", "");
        s1RayAnimateTag2.setAttribute("to", "");
        s1RayAnimateTag2.setAttribute("dur", "");
        s1RayAnimateTag2.setAttribute("fill", "");
        s1RayAnimateTag2.setAttribute("restart", "");
    }

    function resumeS1RayColors(){

        let animTag = document.getElementById("Gradient1_HoverTrackAnimTag_Stop2");

        animTag.setAttribute("attributeName", "");
        animTag.setAttribute("values", "");
        animTag.setAttribute("dur", "");
        animTag.setAttribute("repeatCount", "");
        animTag.endElement();


    }



    //dealing with s2

    //removing the pause class from the container
    //IMPROVED METHOD: JUST CLERAING THE ENTIRE CLASSLIST on all of the spotlight's elements to reset them so that the patrolLoop can orient them from scratch
    document.getElementById("spotlight2Container").className = "";
    document.getElementById("spotlight2Container").classList = [];

    document.getElementById("spotlight2NativeRadGradContainer").className = "";
    document.getElementById("spotlight2NativeRadGradContainer").classList = [];

    document.getElementById("spotlight2HBLLinkedRadGradContainer").className = "";
    document.getElementById("spotlight2HBLLinkedRadGradContainer").classList = [];

    resumeS2Ray();

    resumeS2ClipPath();

    resumeS2RayColors();

    function resumeS2Ray(){
        let s2RaySVGCont = document.getElementById("spotlight2SVGBox");
        s2RaySVGCont.className = "";
        s2RaySVGCont.classList = [];
        let s2RayAnimateTag1 = document.querySelector("#spotlight2RayPath2_AnimTag_Stage1");
      //  s1RayAnimateTag1.endElement();
       // s1RayAnimateTag1.setAttribute("additive", "replace");
        s2RayAnimateTag1.setAttribute("repeatCount", "");
        s2RayAnimateTag1.setAttribute("calcMode", "");
        s2RayAnimateTag1.setAttribute("begin", "");
        s2RayAnimateTag1.setAttribute("from", "");
        s2RayAnimateTag1.setAttribute("to", "");
        s2RayAnimateTag1.setAttribute("dur", "");
        s2RayAnimateTag1.setAttribute("fill", "");
        s2RayAnimateTag1.setAttribute("restart", "");

         let s2RayAnimateTag2 = document.querySelector("#spotlight2RayPath2_AnimTag_Stage2");

          s2RayAnimateTag2.setAttribute("repeatCount", "");
        s2RayAnimateTag2.setAttribute("calcMode", "");
        s2RayAnimateTag2.setAttribute("begin", "");
        s2RayAnimateTag2.setAttribute("from", "");
        s2RayAnimateTag2.setAttribute("to", "");
        s2RayAnimateTag2.setAttribute("dur", "");
        s2RayAnimateTag2.setAttribute("fill", "");
        s2RayAnimateTag2.setAttribute("restart", "");


    }

    function resumeS2ClipPath(){
        
        let s2ClipPathCircle = document.getElementById("spotlight2ClipPath");

        s2ClipPathCircle.setAttribute("rx", "0");
        s2ClipPathCircle.setAttribute("ry", "0");

        let animTagX = document.querySelector("#spotlight2ClipPath_AnimTagX");
        animTagX.setAttribute("repeatCount", "");
        animTagX.setAttribute("attributeName", "");
        animTagX.setAttribute("calcMode", "");
        animTagX.setAttribute("from", "");
        animTagX.setAttribute("to", "");
        animTagX.setAttribute("dur", "");
        animTagX.setAttribute("fill", "");

        let animTagY = document.querySelector("#spotlight2ClipPath_AnimTagY");
        animTagY.setAttribute("repeatCount", "");
        animTagY.setAttribute("attributeName", "");
        animTagY.setAttribute("calcMode", "");
        animTagY.setAttribute("from", "");
        animTagY.setAttribute("to", "");
        animTagY.setAttribute("dur", "");
        animTagY.setAttribute("fill", "");


    }

    function resumeS2RayColors(){
        
        let animTag = document.getElementById("spotlight2_Gradient_HoverTrackAnimTag_Stop2");

        animTag.setAttribute("attributeName", "");
        animTag.setAttribute("values", "");
        animTag.setAttribute("dur", "");
        animTag.setAttribute("repeatCount", "");
        animTag.endElement();

    }


    spotlightPatrolLoop_bothSpotlights();

    //removing the Cont_RG pause class
   // document.getElementById("spotlight1NativeRadGradContainer").classList.remove("pauseAnimClass");

    //pausing the HBL RG
    //document.getElementById("spotlight1HBLLinkedRadGradContainer").classList.remove("pauseAnimClass");

    //TO DO : Pause the Clip Path and the Ray points

    mouseOnButtons = false;

    console.log("Current value of mouseOnButtons: " + mouseOnButtons);

}


function triggerTrackingSpotlightsAnim_CSSTrigger(e){
    //Dealing with S1
    let s1 = document.getElementById("spotlight1Container");



    //TO DO: Calc the extHalosOpaqueShellOffset dynamically
    //Note: keep this for reference. When its hardcoded at 18, it seems to have an accurate effect
  //  let extHalosOpaqueShellOffset = 18;
    let extHalosOpaqueShellOffset = calcExtHalosOpaqueShellOffset("S1");
    //Note: I find that multiplying it by 3.2 has a more accurate overlapping effect
    extHalosOpaqueShellOffset = extHalosOpaqueShellOffset * 3.2;
    console.log("Haddock:" + extHalosOpaqueShellOffset);


    let mousePosRO = getRO([e.x, e.y], globalS1AxisCoordsForMouseTracking);

    let mouseHoverDisps = calcMouseHoverDisplacement(S1_Halos_Width/2, mousePosRO);

    mouseHoverDisps[0] = mouseHoverDisps[0] * 1;
    mouseHoverDisps[1] = mouseHoverDisps[1] * 1;

    mousePosRO = getRO([e.x + mouseHoverDisps[0], e.y + (mouseHoverDisps[1]/1.5)], globalS1AxisCoordsForMouseTracking);

    root.style.setProperty('--S1_Cont_MousePosRO', mousePosRO + "rad");
    root.style.setProperty('--S1_Cont_PrevFrameMousePosRO', mousePosRO + "rad");

    //console.log("TrigTrack: RO: " + mousePosRO * (180/Math.PI));

    let s1_rg = document.getElementById("spotlight1NativeRadGradContainer");

    //calcing the stretch (margin bottom) value for the cont_rg
    let s1_rg_mousePosMB = getRadius([e.x + mouseHoverDisps[0], e.y + mouseHoverDisps[1]], globalS1AxisCoordsForMouseTracking);

    //displacing that margin bottom value by the center of the CPT to align it on top of the mouse cursor
    s1_rg_mousePosMB = s1_rg_mousePosMB - (S1_Halos_Height / 2) - (S1_Halos_Height / 4);

    root.style.setProperty('--S1_Cont_RG_PrevFrameMB', s1_rg_mousePosMB + "px");
    root.style.setProperty('--S1_Cont_RG_MousePosMB', s1_rg_mousePosMB + "px");

    triggerS1RayTrack();

   

   

    function triggerS1RayTrack(){
    //now dealing with the ray
    let s1RaySVGCont = document.getElementById("spotlight1SVGBox");

    let axisSrc_To_MousePos = getRadius([e.x, e.y], globalS1AxisCoordsForMouseTracking);

  

    //Creating ray points (remember we are working in an upside down orientation)
    let Ray_BL = s1RaySVGCont.createSVGPoint();
    Ray_BL.x = ((s1RaySVGCont.clientWidth) / 2) - 2;
    Ray_BL.y = s1RaySVGCont.clientHeight;

    let Ray_BR = s1RaySVGCont.createSVGPoint();
    Ray_BR.x = ((s1RaySVGCont.clientWidth) / 2) + 2;
    Ray_BR.y = s1RaySVGCont.clientHeight;



    let Ray_TL = s1RaySVGCont.createSVGPoint();
    //TO DO: Add the Ext Halos Opaque Shell Offset Here
    Ray_TL.x = ((s1RaySVGCont.clientWidth / 2) - (S1_Halos_Width / 2)) + extHalosOpaqueShellOffset;
   // console.log("TriggerTrack: S1_Halos_Width: " + S1_Halos_Width);

   /**Update 7th June: Adding half the halos height to better align it with mouse (and match with other spotlight's halo) */
    Ray_TL.y = (s1RaySVGCont.clientHeight) - axisSrc_To_MousePos + (S1_Halos_Height/4);

    let Ray_TR = s1RaySVGCont.createSVGPoint();
    Ray_TR.x = ((s1RaySVGCont.clientWidth / 2) + (S1_Halos_Width / 2)) - extHalosOpaqueShellOffset;
        Ray_TR.y = (s1RaySVGCont.clientHeight) - axisSrc_To_MousePos + (S1_Halos_Height / 4);

    let Ray_CP1 = s1RaySVGCont.createSVGPoint();
    Ray_CP1.x = (((s1RaySVGCont.clientWidth) / 2));
        Ray_CP1.y = ((s1RaySVGCont.clientHeight) - axisSrc_To_MousePos) + (S1_Halos_Height / 2) + (S1_Halos_Height / 4);

    let rayStringLiveTrack = createRayString_OneControlPoint(Ray_BL, Ray_BR, Ray_TR, Ray_TL, Ray_CP1);

    //first clearing the 2nd anim tag to remove any previous history
        let s1RayAnimateTag2 = document.querySelector("#spotlight1RayPath2_AnimTag_Stage2");
        s1RayAnimateTag2.endElement();
        s1RayAnimateTag2.setAttribute("repeatCount", "");
        s1RayAnimateTag2.setAttribute("calcMode", "");
        s1RayAnimateTag2.setAttribute("begin", "");
        s1RayAnimateTag2.setAttribute("from", "");
        s1RayAnimateTag2.setAttribute("to", "");
        s1RayAnimateTag2.setAttribute("dur", "");
        s1RayAnimateTag2.setAttribute("fill", "");


  //  console.log("rayStringLiveTrack: " + rayStringLiveTrack);
    //Setting the tracking Animation
    let s1RayAnimateTag1 = document.querySelector("#spotlight1RayPath2_AnimTag_Stage1");


    s1RayAnimateTag1.setAttribute("repeatCount", "1");
    s1RayAnimateTag1.setAttribute("calcMode", "linear");
    s1RayAnimateTag1.setAttribute("begin", 0 + "s");
    s1RayAnimateTag1.setAttribute("from", rayStringLiveTrack);
    s1RayAnimateTag1.setAttribute("to", rayStringLiveTrack);
    /*Note: It's important to set the dur as 0, if you set it as 1 or anything above 0, it will result in a snapping in the subsequent ray animation*/
    s1RayAnimateTag1.setAttribute("dur", 0 +"s");
    s1RayAnimateTag1.setAttribute("fill", "freeze");

    }


    //dealing with s2
    //Design Note: You are currently using the Y-value of GlobalS1AxisCoords Because the Y value of GlobalS2 is messed up for some reason
    let mousePosRO_S2 = getRO([e.x, e.y], [globalS2AxisCoordsForMouseTracking[0], globalS1AxisCoordsForMouseTracking[1]]);
 //console.log("trigTrack S2 _ RO: " + mousePosRO_S2 * (180/Math.PI));
    //activateStartPosSquarePointer(globalS2AxisCoordsForMouseTracking[0], globalS2AxisCoordsForMouseTracking[1]);
   // activatePointDPosSquarePointer(globalS2AxisCoordsForMouseTracking[0], globalS2AxisCoordsForMouseTracking[1]);
    
   // let gs2Floored = [Math.floor(globalS2AxisCoordsForMouseTracking[0]), Math.floor(globalS2AxisCoordsForMouseTracking[1])];

    /**TESTING */ 
  //  activateDestPosSquarePointer(globalS2AxisCoordsForMouseTracking[0], globalS2AxisCoordsForMouseTracking[1]-50);
   // activateDestPosSquarePointer(globalS1AxisCoordsForMouseTracking[0], globalS1AxisCoordsForMouseTracking[1]);
    // activateDestPosSquarePointer(600, 500);

    /**TESTING */
    
    let mouseHoverDisps_S2 = calcMouseHoverDisplacement(S2_Halos_Width / 2, mousePosRO_S2);
    
    
    mousePosRO_S2 = getRO([e.x - mouseHoverDisps_S2[0], e.y - (mouseHoverDisps_S2[1]/1.5)], [globalS2AxisCoordsForMouseTracking[0], globalS1AxisCoordsForMouseTracking[1]]);



    root.style.setProperty('--S2_Cont_MousePosRO', mousePosRO_S2 + "rad");
    root.style.setProperty('--S2_Cont_PrevFrameMousePosRO', mousePosRO_S2 + "rad");
   
    //calcing the stretch (margin bottom) value for the cont_rg
    let s2_rg_mousePosMB = getRadius([e.x + mouseHoverDisps_S2[0], e.y + mouseHoverDisps_S2[1]], [globalS2AxisCoordsForMouseTracking[0], globalS1AxisCoordsForMouseTracking[1]]);
    
    //displacing that margin bottom value by the center of the CPT to align it on top of the mouse cursor
    s2_rg_mousePosMB = s2_rg_mousePosMB - (S2_Halos_Height / 2) - (S2_Halos_Height/4);

    root.style.setProperty('--S2_Cont_RG_PrevFrameMB', s2_rg_mousePosMB + "px");
    root.style.setProperty('--S2_Cont_RG_MousePosMB', s2_rg_mousePosMB + "px");

    triggerS2RayTrack(mouseHoverDisps_S2);

    function triggerS2RayTrack(mouseHoverDisps_S2){

         //now dealing with the ray
        let s2RaySVGCont = document.getElementById("spotlight2SVGBox");

        let axisSrc_To_MousePos = getRadius([e.x + mouseHoverDisps_S2[0], e.y + (mouseHoverDisps_S2[1]/1) ], [globalS2AxisCoordsForMouseTracking[0], globalS1AxisCoordsForMouseTracking[1]]);

        //Creating ray points (remember we are working in an upside down orientation)
    let Ray_BL = s2RaySVGCont.createSVGPoint();
    Ray_BL.x = ((s2RaySVGCont.clientWidth) / 2) - 2;
    Ray_BL.y = s2RaySVGCont.clientHeight;

     let Ray_BR = s2RaySVGCont.createSVGPoint();
    Ray_BR.x = ((s2RaySVGCont.clientWidth) / 2) + 2;
    Ray_BR.y = s2RaySVGCont.clientHeight;

     let Ray_TL = s2RaySVGCont.createSVGPoint();
    //TO DO: Add the Ext Halos Opaque Shell Offset Here
    Ray_TL.x = ((s2RaySVGCont.clientWidth / 2) - (S2_Halos_Width / 2)) + extHalosOpaqueShellOffset;
   // console.log("TriggerTrack: S1_Halos_Width: " + S1_Halos_Width);
    Ray_TL.y = (s2RaySVGCont.clientHeight) - axisSrc_To_MousePos + (S2_Halos_Height/4);

    let Ray_TR = s2RaySVGCont.createSVGPoint();
    Ray_TR.x = ((s2RaySVGCont.clientWidth / 2) + (S2_Halos_Width / 2)) - extHalosOpaqueShellOffset;
    Ray_TR.y = (s2RaySVGCont.clientHeight) - axisSrc_To_MousePos + (S2_Halos_Height/4);

    let Ray_CP1 = s2RaySVGCont.createSVGPoint();
    Ray_CP1.x = (((s2RaySVGCont.clientWidth) / 2));
        Ray_CP1.y = ((s2RaySVGCont.clientHeight) - axisSrc_To_MousePos) + (S2_Halos_Height / 2) + (S2_Halos_Height / 4);

    let rayStringLiveTrack = createRayString_OneControlPoint(Ray_BL, Ray_BR, Ray_TR, Ray_TL, Ray_CP1);

        //first clearing the 2nd anim tag to remove any previous history
        let s2RayAnimateTag2 = document.querySelector("#spotlight2RayPath2_AnimTag_Stage2");
        s2RayAnimateTag2.endElement();
        s2RayAnimateTag2.setAttribute("repeatCount", "");
        s2RayAnimateTag2.setAttribute("calcMode", "");
        s2RayAnimateTag2.setAttribute("begin", "");
        s2RayAnimateTag2.setAttribute("from", "");
        s2RayAnimateTag2.setAttribute("to", "");
        s2RayAnimateTag2.setAttribute("dur", "");
        s2RayAnimateTag2.setAttribute("fill", "");

    
    //Setting the tracking Animation
    let s2RayAnimateTag1 = document.querySelector("#spotlight2RayPath2_AnimTag_Stage1");

    s2RayAnimateTag1.setAttribute("repeatCount", "1");
    s2RayAnimateTag1.setAttribute("calcMode", "linear");
    s2RayAnimateTag1.setAttribute("begin", 0 + "s");
    s2RayAnimateTag1.setAttribute("from", rayStringLiveTrack);
    s2RayAnimateTag1.setAttribute("to", rayStringLiveTrack);
    /*Note: It's important to set the dur as 0, if you set it as 1 or anything above 0, it will result in a snapping in the subsequent ray animation*/
    s2RayAnimateTag1.setAttribute("dur", 0 +"s");
    s2RayAnimateTag1.setAttribute("fill", "freeze");







        
    }


    //will return x and y dispalcements. NOTE: UNUSED FUNCTION
    function calcMouseHoverDisplacement(hyp, ro){

        let yDisp = Math.sin(ro) * hyp;
        let xDisp = Math.cos(ro) * hyp;

        return [xDisp, yDisp];


    }

}

//Will pause BOTH of the spotlight's anims (ext halos, cont and cont_rg)
function pauseSpotlightsAnims_CSSTrigger(){

    

    //first disabling the event listener clip path animTagX 
    let animTagX = document.querySelector("#spotlight1ClipPath_AnimTagX");
    animTagX.removeEventListener("endEvent", globalRestartListener);



    //preventing REFIRING of function by checking mouseOnButtons global var
    if(mouseOnButtons==true){
        return;
    }
    console.log("Entered Pause 2nd Stage");
    mouseOnButtons = true;

    //DEALING WITH S1

    //updating the postPause RO of S1Cont
    //first calc the current HBL_RG
    let currX_HBL_RG = document.getElementById("spotlight1HBLLinkedRadGradContainer").getBoundingClientRect().x;
    let currY_HBL_RG = document.getElementById("spotlight1HBLLinkedRadGradContainer").getBoundingClientRect().y;
    let axisSrcCoords = getAxisSourceCoords("spotlight1EmitterMock");

    let currRO = getRO([currX_HBL_RG, currY_HBL_RG], axisSrcCoords);
    root.style.setProperty('--S1_Cont_PrevFrameMousePosRO', currRO + "rad");

    //pausing the container
    document.getElementById("spotlight1Container").classList.toggle("mouseTrackSweepClass_S1_Cont");

    //Calculating the margin bottom of S1_Cont_RG (find hypoteneuse)
    //actually we don't need to update the prev frame here. Do that in the trigger tracking function. we just need to pause it
    document.getElementById("spotlight1NativeRadGradContainer").classList.toggle("mouseTrackSweepClass_S1_Cont_RG");


    //updating the globalS1AxisCoordsForMouseTracking variable so that the triggerTrackingSpotlightsAnim_CSSTrigger function can reference it
    //For s1
    globalS1AxisCoordsForMouseTracking = getAxisSourceCoords("spotlight1EmitterMock");

    //Now setting the Ray
    //We have to simply pause the animations here and then trigger the live tracking in the live track function
    //Pausing both ray anim tags. (Clearing their anim tag's attributes to empty)
    //TO DO LATER: Add a transition animation instead of just an abrupt pause. That way it will look liike the
    pauseS1Ray();

    pauseS1ClipPath();

    pauseS1HBL_RG();

    

    //Dealing with S2

    //first calc the current HBL_RG
    let currX_HBL_RG_S2 = document.getElementById("spotlight2HBLLinkedRadGradContainer").getBoundingClientRect().x;
    let currY_HBL_RG_S2 = document.getElementById("spotlight2HBLLinkedRadGradContainer").getBoundingClientRect().y;
    let axisSrcCoords_S2 = getAxisSourceCoords("spotlight2EmitterMock");

    let currRO_S2 = getRO([currX_HBL_RG_S2, currY_HBL_RG_S2], axisSrcCoords_S2);

    root.style.setProperty('--S2_Cont_PrevFrameMousePosRO', currRO_S2 + "rad");

    document.getElementById("spotlight2Container").classList.toggle("mouseTrackSweepClass_S2_Cont");

    //dealing with S2 Cont_RG
    document.getElementById("spotlight2NativeRadGradContainer").classList.toggle("mouseTrackSweepClass_S2_Cont_RG");

   
    //updating the globalS2AxisCoordsForMouseTracking variable so that the triggerTrackingSpotlightsAnim_CSSTrigger function can reference it
    //For s2
    globalS2AxisCoordsForMouseTracking = getAxisSourceCoords("spotlight2EmitterMock");

    pauseS2Ray();

    pauseS2ClipPath();

    pauseS2HBL_RG();

    //logging the last known coords of the halo
    //currPos_S1[0] = document.getElementById("spotlight1HBLLinkedRadGradContainer").getBoundingClientRect().left;
   // currPos_S1[1] = document.getElementById("spotlight1HBLLinkedRadGradContainer").getBoundingClientRect().top;

    //pausing the Cont_RG
  //  document.getElementById("spotlight1NativeRadGradContainer").classList.add("pauseAnimClass");

    //pausing the HBL RG
    //document.getElementById("spotlight1HBLLinkedRadGradContainer").classList.add("pauseAnimClass");

    //TO DO : Pause the Clip Path and the Ray points


    

    


    function pauseS1Ray() {
        



        let s1RayAnimateTag2 = document.querySelector("#spotlight1RayPath2_AnimTag_Stage2");
        s1RayAnimateTag2.endElement();
        s1RayAnimateTag2.setAttribute("repeatCount", "");
        s1RayAnimateTag2.setAttribute("calcMode", "");
        s1RayAnimateTag2.setAttribute("begin", "");
        s1RayAnimateTag2.setAttribute("from", "");
        s1RayAnimateTag2.setAttribute("to", "");
        s1RayAnimateTag2.setAttribute("dur", "");
        s1RayAnimateTag2.setAttribute("fill", "");
        s1RayAnimateTag2.setAttribute("restart", "");

        let s1RayAnimateTag1 = document.querySelector("#spotlight1RayPath2_AnimTag_Stage1");
        s1RayAnimateTag1.endElement();
        s1RayAnimateTag1.setAttribute("repeatCount", "");
        s1RayAnimateTag1.setAttribute("calcMode", "");
        s1RayAnimateTag1.setAttribute("begin", "");
        s1RayAnimateTag1.setAttribute("from", "");
        s1RayAnimateTag1.setAttribute("to", "");
        s1RayAnimateTag1.setAttribute("dur", "");
        s1RayAnimateTag1.setAttribute("fill", "");
        s1RayAnimateTag1.setAttribute("restart", "");
    }

    function pauseS2Ray(){

        let s2RayAnimateTag2 = document.querySelector("#spotlight2RayPath2_AnimTag_Stage2");
        s2RayAnimateTag2.endElement();
        s2RayAnimateTag2.setAttribute("repeatCount", "");
        s2RayAnimateTag2.setAttribute("calcMode", "");
        s2RayAnimateTag2.setAttribute("begin", "");
        s2RayAnimateTag2.setAttribute("from", "");
        s2RayAnimateTag2.setAttribute("to", "");
        s2RayAnimateTag2.setAttribute("dur", "");
        s2RayAnimateTag2.setAttribute("fill", "");

        let s2RayAnimateTag1 = document.querySelector("#spotlight2RayPath2_AnimTag_Stage1");
        s2RayAnimateTag1.endElement();
        s2RayAnimateTag1.setAttribute("repeatCount", "");
        s2RayAnimateTag1.setAttribute("calcMode", "");
        s2RayAnimateTag1.setAttribute("begin", "");
        s2RayAnimateTag1.setAttribute("from", "");
        s2RayAnimateTag1.setAttribute("to", "");
        s2RayAnimateTag1.setAttribute("dur", "");
        s2RayAnimateTag1.setAttribute("fill", "");

       

    }

    function pauseS1ClipPath(){

        //stage 1: reduce the radius to 0 to make it disappear
        let s1ClipPathCircle = document.getElementById("spotlight1ClipPath");
        s1ClipPathCircle.setAttribute("rx", "0");
        s1ClipPathCircle.setAttribute("ry", "0");

        //stage2: set freeze to none to erase out previous render frame
        //the line below might be useless
      //  s1ClipPathCircle.setAttribute("fill", "remove");

        let animTagX = document.querySelector("#spotlight1ClipPath_AnimTagX");

        //endElement is an inbuilt SVG function which terminates an animation
        animTagX.endElement();
        animTagX.setAttribute("repeatCount", "");
        animTagX.setAttribute("attributeName", "");
        animTagX.setAttribute("calcMode", "");
        animTagX.setAttribute("from", "");
        animTagX.setAttribute("to", "");
        animTagX.setAttribute("dur", "");
        animTagX.setAttribute("fill", "remove");
        /*animTagX.setAttribute("end", "0s");*/


        let animTagY = document.querySelector("#spotlight1ClipPath_AnimTagY");


        //endElement is an inbuilt SVG function which terminates an animation
        animTagY.endElement();
        animTagY.setAttribute("repeatCount", "");
        animTagY.setAttribute("attributeName", "");
        animTagY.setAttribute("calcMode", "");
        animTagY.setAttribute("from", "");
        animTagY.setAttribute("to", "");
        animTagY.setAttribute("dur", "");
        animTagY.setAttribute("fill", "remove");
       /* animTagY.setAttribute("end", "0s");*/


    }

    function pauseS2ClipPath(){

        //stage 1: reduce the radius to 0 to make it disappear
        let s2ClipPathCircle = document.getElementById("spotlight2ClipPath");
        s2ClipPathCircle.setAttribute("rx", "0");
        s2ClipPathCircle.setAttribute("ry", "0");

        let animTagX_S2 = document.querySelector("#spotlight2ClipPath_AnimTagX");

        //endElement is an inbuilt SVG function which terminates an animation
        animTagX_S2.endElement();
        animTagX_S2.setAttribute("repeatCount", "");
        animTagX_S2.setAttribute("attributeName", "");
        animTagX_S2.setAttribute("calcMode", "");
        animTagX_S2.setAttribute("from", "");
        animTagX_S2.setAttribute("to", "");
        animTagX_S2.setAttribute("dur", "");
        animTagX_S2.setAttribute("fill", "remove");

        let animTagY_S2 = document.querySelector("#spotlight2ClipPath_AnimTagY");

        //endElement is an inbuilt SVG function which terminates an animation
        animTagY_S2.endElement();
        animTagY_S2.setAttribute("repeatCount", "");
        animTagY_S2.setAttribute("attributeName", "");
        animTagY_S2.setAttribute("calcMode", "");
        animTagY_S2.setAttribute("from", "");
        animTagY_S2.setAttribute("to", "");
        animTagY_S2.setAttribute("dur", "");
        animTagY_S2.setAttribute("fill", "remove");

    }

    //Will simply hide the HBL_RG because its needed only for illumination within the logo area
    function pauseS1HBL_RG(){

        document.getElementById("spotlight1HBLLinkedRadGradContainer").classList.toggle("mouseTrackSweepClass_S1_HBL_RG");



    }

    

    function pauseS2HBL_RG(){


        document.getElementById("spotlight2HBLLinkedRadGradContainer").classList.toggle("mouseTrackSweepClass_S2_HBL_RG");




    }

}



//Will terminate all the currently active anims on both the spotlights
function terminateSpotlightAnims_bothSpotlights(){

    console.log("current Spotlight1Cont class BEFore revrert:: " + document.getElementById("spotlight1Container").className);

   // document.getElementById("spotlight1Container").classList.remove("pauseAnimClass");

    console.log("current Spotlight1Cont class after revert: " + document.getElementById("spotlight1Container").className);

}



//Will acquire the real time pixel coordinates of S1 halo (wherever it is....whether its static or in the middle of an animation)
function getCurrS1Coords_CenterOfRG(){

    //get the x and y coords of the halos
    let s1X = document.getElementById("spotlight1HBLLinkedRadGradContainer").getBoundingClientRect().left;
    let s1Y = document.getElementById("spotlight1HBLLinkedRadGradContainer").getBoundingClientRect().top;

    //displace by the halo offset
    s1X = s1X + (   (document.getElementById("spotlight1HBLLinkedRadGradContainer").getBoundingClientRect().width)/2 );
    s1Y = s1Y + ((document.getElementById("spotlight1HBLLinkedRadGradContainer").getBoundingClientRect().height) / 2);

    return [s1X, s1Y];



}

//-----------------END OF REAL TIME MOUSE TRACKING FUNCS---------------------


function activateSpotlightColorAnims(){

    activateColorAnims_S1Ray();

    activateColorAnims_S2Ray();

    function activateColorAnims_S1Ray(){
        let animTag = document.getElementById("Gradient1_HoverTrackAnimTag_Stop2");

        animTag.setAttribute("attributeName", "stop-color");
        animTag.setAttribute("values", "red; blue; red");
        animTag.setAttribute("dur", "2s");
        animTag.setAttribute("repeatCount", "indefinite");
        animTag.beginElement();
    
    }


    function activateColorAnims_S2Ray(){

        let animTag = document.getElementById("spotlight2_Gradient_HoverTrackAnimTag_Stop2");

        animTag.setAttribute("attributeName", "stop-color");
        animTag.setAttribute("values", "blue; red; blue");
        animTag.setAttribute("dur", "1.6s");
        animTag.setAttribute("repeatCount", "indefinite");
        animTag.beginElement();

    }
    
    
    }

function funcx(){
    window.location.href = "https://zoneofabi.github.io/ruff/";
}


function redirectToExtSite(pageName){
    
    switch(pageName){

        case "RuffDocs":
            window.location.href = "https://zoneofabi.github.io/ruffdocs/";
            break;

        case "RuffEngine":
            window.location.href = "https://zoneofabi.github.io/ruff/";
            break;


        case "ETSDocs":
            window.location.href = "https://zoneofabi.github.io/etsdocs/";
            break;


        case "ZOADocs":
            window.location.href = "https://zoneofabi.github.io/zoadocs/";
            break;

        case "ArtOfCoding":
            window.location.href = "https://zoneofabi.github.io/writing/ca/";
            break;
            

        case "Buzz":
            window.location.href = "https://zoneofabi.github.io/art/";
            break;
            
            
        case "ATST":
            window.location.href = "https://zoneofabi.github.io/art/";
            break;

        case "ReceiverReview":
            window.location.href = "https://zoneofabi.github.io/writing/";
            break;   
            
        case "AceCombatReview":
            window.location.href = "https://zoneofabi.github.io/writing/";
            break;    

    }

    

}
