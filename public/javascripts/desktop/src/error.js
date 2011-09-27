$(document).ready($(function()
{
   if($("#warningMsg").text())
   {
      Genesis.showWarningMsg($("#warningMsg").text());

   }
   if($("#errorMsg").text())
   {
      Genesis.showErrMsg($("#errorMsg").text());
   }
}));
