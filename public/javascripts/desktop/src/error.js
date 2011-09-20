$(document).ready($(function()
{
   if($("#warningMsg").text())
   {
      showWarningMsg($("#warningMsg").text());

   }
   if($("#errorMsg").text())
   {
      showErrMsg($("#errorMsg").text());
   }
}));
