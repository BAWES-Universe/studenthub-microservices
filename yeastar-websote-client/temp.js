const a = {
    "type":30011,"sn":"3631B4444099","msg":"{\"call_id\":\"1725446451.243\",\"members\":[{\"inbound\":{\"from\":\"94424722\",\"to\":\"6402\",\"trunk_name\":\"stc\",\"channel_id\":\"PJSIP/trunk-stc-endpoint-0000008f\",\"member_status\":\"BYE\",\"call_path\":\"\"}}]}"} ;

    if (a.type) {
        let b = JSON.parse(a.msg);

        console.log(a);
        //console.log(b.members[0].inbound);

        const data = Object.assign(JSON.parse(a.msg), { 
          type: a.type,
          sn: a.sn
        });
  
        console.log(JSON.stringify(data));
      }