// controllers/equipamentosController.js
const db = require('../config/db');
const Equipamento = require('../models/Equipamento');

exports.listarEquipamentos = async (req, res) => {
    try {
        const data = await Equipamento.getAll();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao listar equipamentos' });
    }
};

exports.criarEquipamento = async (req, res) => {
    try {
        const id = await Equipamento.create(req.body);
        res.status(201).json({ idEquip: id });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao criar equipamento' });
    }
};

exports.gerarEtiqueta = async (req, res) => {
    const id = req.params.id;

    try {
        const [rows] = await db.query(`
            SELECT e.idEquip, e.ambiente, e.descDefeito, u.nomeUnidade, t.nomeTec
            FROM equipamentos e
            LEFT JOIN unidades u ON e.idUnidade = u.idUnidade
            LEFT JOIN tecnicos t ON e.idTecnico = t.idTec
            WHERE e.idEquip = ?
        `, [id]);

        const eq = rows[0];
        if (!eq) return res.status(404).json({ error: 'Equipamento não encontrado' });

        const dataHoje = new Date().toLocaleDateString('pt-BR');

        // Aqui vai o seu ZPL completo como string entre crases:
        const zpl = `CT~~CD,~CC^~CT~
^XA
^PR3
^MD30
^PW480
^FO0,288^GFA,02048,02048,00016,:Z64:
eJzt1DGuozAQANCxXNBEcAGE9wi/pIjWZ/k3gI7iayHN0iVH2KsgpeAaRFzAaBsXlmfHGAIfkeRLW6200z0ZzDCeMcD/+KcjiHRkApvmiGZju2NWDxpACjwp+E7mrXNJ7iDxNmuzy2/nX8i8QdI+ArFhPT4yysW8VQGihuD0RWt6n2uztuXabtZXloANqGrKj+sQyg5uzQMznUDZLAYqTcmxAzbXy6Y/HnisL1jITYFNNh/AczMUaI+FaDL9dnD5YIQ2JtNDyY7Z7MFkid/imHFMpJXV5NRbrB3P5pWFMKY/Hjpw+fNmcr44WhuFjnody7NQUz7OCVnvmeHFkA/yLPVhrM/QXuIAXH/B5PNnX0cP3ryNmhDkrVXHwtxdkuPCbuz72XIFJWrVV34/G4zO9820cB1CTQVvH+P5R7pE7AIL/nsr28Xu+czXh+kISptGBmaHTwzQ8dP1whqQyltRa9ZkoSfz2b5/DlRD2uIbtv74QucEcqxf+OdIGV3PNJ86PBaTW+94a9+BUslKUL9QP8QbJ3vrFBkUHSi4x+jsa+Y0zFlfJ/N95JxPtpt1X0/qX1Hf9Dyvr9yatLQlzW9vvWl+zWh8aPvZGf0v5C88rEz5ypXzZ6Z8mXHzu+Q/Ol8Ma7vLz3yI6n2pD9B8Bqdnll1wv4/+Lv4AXrlDXA==:7849
^FO96,352^GFA,02304,02304,00036,:Z64:
eJzt0jFOxTAMBmBHHTzmCLlJcyVO0JSJDY7ATVDQGxi5AIK+GwSxGL3Ixk7eg74ndoTUf8jQflUd2wBbtmzZ8kfBha4oSvYZ0uwIkAB8gZgxj3qGOTZD3ThZ1AQGiBWk4DI6KSGntUEpapIACDshLOMg5PN0bqiZGUQGqWq8VC+8Nr4Zkdl1Q2r4aD4rgTezr2o4ZFfjTWGso8+MUu1m3yabqVo8hZtlMlPTybycDJgBO1ENq4k/JrR6yN5qyU6aETPDO5k5vHaDMg8Vkj6z5kz49osZZFET9R6pmnl+WJnbbuxzBq89DNyMddx9lDODZCDN+jMzT80cmpG7fi+tOGjFQU00s2OX04XBvZlJTT0avzAclmZQZ7ET0XnF+9znZeZRm8wgZ0annPwS1aRm+iAuTWlGy+Zu9CtIeW10xxhL37FmJt2xCwPpug7Ud7WZ0UA3W/5RvgDZq1vo:CCE9
^FO128,352^GFA,01024,01024,00032,:Z64:
eJzt0rFqwzAQANATAnlR7fVKAv4FlS7e1E/R1K7+gEJkAs0S6C9dMKRLPqCjunTO6IKxK52T0mQoWbrlttODO91JANf4z5B7p9GoguxOrADE2Azyw5suivAWIOvYy7DYiVcffTkUX/5+YB8J8rlBRF3VYStvKRZYKY30lCdvQgBU7A5pKzH5i0JNj5LdG6gy22HZhzm9jUgWxDr6+Cmhn9zIco9FR5raAeHgiy1MjtHRYOyoXaswzsPuWs/1++SxtzKk7WadfEx+1+z/dv/M88EvrycXk+dHrzJFKF2YO3r/8Rko9nh/VOwOj57mnyn2hkzcH3tV1wdfJc+m+nF/WSeX44bKYKlG4P2jzmUf3fYLiu/HXlB58Ca56Nitv+AHZO785OEkK8K500l2Q2csLul6aXwD1KyHAA==:072C
^FO192,320^GFA,01536,01536,00024,:Z64:
eJzt0rFuwyAQBuBDSNDhCusNSHkFRg+V+ireMtajB0smU16Lra/BI3j0ELkBEwjK1k4dfAOWPqTzz+kA/l0FA6BbUMzHk4WPF9csxJNDD0CtM2f/5toTDwj9dxjpJsbqp4X0Gv1rmd43uVXvRjIm+tShvspr9Z6IMPpAqLjkz/8a6hSme0Qu+GV3AR6QrKjOnE/xDHfVLaKIPqjs8y37eUHcisc+xWePei19Up7UR/+ECVA7wS41J8Y80XuIaRu3j/x7niZ/1+X3DhaVaN5b5vO5zHITz/nIxzxPfuZrM8996pi+mHL/1rkbyj5Q63kf9v0p/pY8789RRx31Wne+jlu+:95F7
^FO384,320^GFA,01152,01152,00012,:Z64:
eJzN0z1u2zAUAODHcuASiBdQpF6hm40q1pVkZKiBBiELDx5zgaA+SlkYqDfnAkEio4OXwlA2FVX18h4lk0bR7uVAfRCo9ycJ4B9L9qoH407uwNjBnW5PVkVSwWE4ryZpHX1Vw3FwUr130R9tcP0Bog/B6f4YfPl1B7AbvblnS848JQsyVzfdpmzl/TC4Jr/bkb+Bat4CzNlbSl+R+xTkCvSkAVhgwlZTeqAoE4VLK79QoDRXiMtGrilZoleIAsVnrlOtmzeA+0fuUSLt5ufglvYC79mCs2elN7C1HswVqrvU20/yiV16i45thlaRo2G0GMdqqGRqw6+Kt/H+5E9f22hz5tJF6++IzWjqFvvRgox2MO80zArGJZpoWMC8OfkGrrnmCzZ9NR1dcj5/hDIb88otXCRcD41ErWiW5BcKkNMwqHdR3wDMpE+s2hmFJy+ozI4CNfR26WiWIZ3LHU94ptFKVzr+BoxCp+wCFLVqVr+cpio1D/h5Wmc0tVsupb+sCzDY+RJz10KJvnzUn+iqeUrioJfu1OpmfbDBvzG0vW9vg1+40HHNuyy47IvouzY4V2FioJd1sNq4YIE2GGJa+gej9Y/oPD4KV+7v98+tz8L/B+sVfrzI3Q==:75AF
^FO192,256^GFA,02304,02304,00036,:Z64:
eJzt071OxSAUAGAICSwIK0aSvgLGQYbGvoqP0NGRRyNxNfER5AHuQHIHOxDrOe29vZL746CDMT1LKf3SAwcOIWusscY/CRr9tx9ZfLpgUosPTuKFLI7/smnCXbwdZOackS6IJKWkGcbxNSymS12+KbqgGZMewIiC5i0ups+tb5RWYGjKtgWjFBiS02Ki88ZyIGCCcxID/0nS42HN3lnDpYB5FjxRQKxAE3dG0kCMk2AYGmIIB2PYbAxD4wWZjDxpFI2zGQcnr8vedB9HBnKhafJJM+fCfUGuhuyN+5rrsHdcT23qfXEceWOm+ggwsHproT6iMn3feiuhzkKDsVY9tEoJXZku3WddruCIRjB6EO8bUdhYGQ3nLjKcO92CYYk9v9BMt5WBa4JFwDes4Zk79iPTq2kW+2I2/Mjs+mJqobPmUvOt8SfjE+UKcqE=:B008
^FO256,192^GFA,01792,01792,00028,:Z64:
eJzt0r1qwzAQAOA7BNIi5FWDiPsIN3oIzavkETJ2StS36OOo5EWUJXOmEKiJqrOc2E29lC4t+AYJ9MGh+wH4N6Egfn/E0PBV4ZTFJV9WTGUj+UvbYiSrosajlFJvIawGS68nstVFq2s2mSDsws1wH4isW2qzyKT2Hg7xZgLYSGtt2NCjXw9/idnAaMcpJXqATTE+12xS27tR+X10D8avZDB0JhLnXF172wGmUzGSX021bCUn/5NzUp9TBUBPQw1jy48jQ5/ra2xXnzH8z3CvD98DNS/O5b6oeqG43jjqZ1tfuJ9n8XEWCWDoJzxjW70JngMejtgC1OP5UZmanJrtj2xj+Oz2rDM9WL9n3X4+PVrZzznmmOMPxieUyVlt:EBBA
^FO224,160^GFA,02048,02048,00032,:Z64:
eJzt0rFqwzAQBuATgtNyyB1vEPEreOwQ8KvkETx2KLVLoH0tPYr6Bh49GLkn2Y6TQDqUDh18g7D48CH9OoD/XrprHojyz7Karn/k4Sgrqe5R6wr/xkvo2QRUA5SjDrrXPb6Ary/e+oGLAXWEdjRDMZjRRPCtXz0EZndEU6hA1pGzB/MJ8BVW9yfmipC06oiILaPRoLrT4u++YQaLoM9AjIxgUMuhm+wsf1XiiKCyO8kU06Uq1uKN3fwDCLDwq1vlL15HLKbZh3ISV1Offem/uRpXz/3lfMkrRJr7w4FTf/nr+vyry+nxzvP9mRA1AjmSINL9wZ9u8nNojLh1VirlF8KWf5T863MUNyn9ESPAln8JkXWou0ED6aB6ld4Pyqv3Z/mQjfj88ng3H4vL+/zs4cYbC8v8Sv7wJpt2vPJ5fvP8P4m/yqa+8Tz/e+21116/q2+OGHdb:791B
^FO320,0^GFA,01280,01280,00020,:Z64:
eJzt0bsNgzAQBuAfITkNgtYIlKxwUoq4QMoqZAOXKTNSRrgNMkI8AiUdOUN4GCFF6bnGuk+yfQ9gjz0kIjYgOfWcIuZ7YK4CFHhpIPWXZURnl7tTxy/UX7s+6dIUrVjHo9mGKnMsAW7caLUlo8tEzNWjMRFpnYqx7S2JHoMpb1TrGDAHBJZGvGlbd6c/VNZ5C/4NTeqjdX3SB+lVH9Iv6aIVe0/9Zv693InNc5l2wzzP9JfZdNhbP3zITBk3v7d+oQvz6R74AJHtbFU=:9295
^FO0,64^GFA,01792,01792,00028,:Z64:
eJzt0rGKwzAMAFAZQbQYd81g2n6CxxtK+yvtH+QP6vszl1v7Ec5+g6HD3RCaysElNt560OGIFmE/EJYlgDcH2q6+9HpKZENtYT0lKWxtLf7V9nAABPJSShEahIuf7WzPDmH1y0ZDtDBb73qPoHdsSrGBmc1d7BHByBhNaZ/2CB0fFJOm3FoUbIYPDVuLk6XHdwqgMgL/tNMYEA73ymLpylLNmE6Wa5qsZvbO2cp3sjnnuL+WRXN/VPTeOx//Rav9TilaFfb8T/r5pgFHEEM+hw3PAT1+XUUQt8Jiwnx85lX7oCmnPRuH3NKepf0sbJv2c4kllvhX8QCAP1Uw:708C
^FO0,0^GFA,00768,00768,00008,:Z64:
eJxjYBiugP3/AfYHQFr+/wH5D0Da/v8B+x8Quv4PkK5Hp/kP/PsHpOv4D/ypQ6MLIPIgZSD9KLQ8lGaH0vxo4vb8OOj/+M3jRzN3FNACAAAErUo8:F906
^FO379,316^GB96,96,4^FS
^FO107,316^GB272,0,4^FS
^FO9,59^GB466,0,4^FS
^FO8,19^GB48,44,4^FS
^LRY^FO23,24^GB54,0,33^FS^LRN
^PQ1,1,1,Y^XZ`.replace(/{{dataHoje}}/g, dataHoje)
            .replace(/{{u.nomeUnidade}}/g, eq.nomeUnidade)
            .replace(/{{e.ambiente}}/g, eq.ambiente)
            .replace(/{{e.descDefeito}}/g, eq.descDefeito)
            .replace(/{{t.nomeTec}}/g, eq.nomeTec)
            .replace(/{{idEquip}}/g, eq.idEquip);

        res.setHeader('Content-Type', 'text/plain');
        res.send(zpl);
    } catch (err) {
        console.error('Erro ao gerar etiqueta:', err);
        res.status(500).json({ error: 'Erro ao gerar etiqueta' });
    }
};
