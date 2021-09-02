import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { UploadFileService } from '../campeonato/service/upload-file.service';
import { BaseFormComponent } from '../shared/base-form/base-form.component';
import { FormValidations } from '../shared/form-validations';
import { UsuarioDto } from './model/usuarioDto.model';
import { UsuarioFormService } from './service/cadastro-usuario.service';

@Component({
  selector: 'app-cadastro-usuario',
  templateUrl: './usuario-form.component.html',
  styleUrls: ['./usuario-form.component.css']
})
export class UsuarioFormComponent extends BaseFormComponent implements OnInit {

  usuarioDto: UsuarioDto = new UsuarioDto();
  files: File | undefined;
  nameFile: string = '';
  editar: boolean = false;
  id!: number;
  inscricao!: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private cadastroUsuarioService: UsuarioFormService,
    private service: UploadFileService,
    private route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit() {
    this.formulario = this.formBuilder.group({
      'nome': [null, [Validators.required, Validators.minLength(3), Validators.maxLength(35)]],
      'nick': [null, [Validators.required, Validators.minLength(3), Validators.maxLength(35)]],
      'email': [null, [Validators.required,Validators.email]],
      'confirmarEmail': [null, [Validators.required, FormValidations.equalsTo('email')]],
      'senha': [null, [Validators.required, Validators.minLength(6)]],
      'confirmarSenha': [null, [Validators.required, FormValidations.equalsTo('senha')]],
      'file': [null, []],
    });

    this.inscricao = this.route.data.subscribe(
      (usuario) => {
        if(usuario.form != undefined){
          this.usuarioDto = (usuario.form);
          this.populaDadosForm(usuario.form);
          this.editar = true;
          this.route.params.subscribe(params =>{
            this.id = params['id'];
          })
        }
      }
    );
  }

  populaDadosForm(usuario: UsuarioDto) {
    this.formulario.patchValue({
      nome: usuario.nome,
      nick: usuario.nick,
      email: usuario.email,
      senha: usuario.senha    
    });
  }

  onChange(event: any) {
    console.log(event)
    this.nameFile = event.srcElement.files[0].name;
    this.files = event.srcElement.files[0];
  }

  onUpload() {
    if (this.files && this.files.size > 0) {
      this.service.upload(this.files);
    }
  }

  preenchendoUsuarioDto(){
    this.usuarioDto.nome  = this.formulario.get('nome')?.value;
    this.usuarioDto.nick  = this.formulario.get('nick')?.value;
    this.usuarioDto.email = this.formulario.get('email')?.value;
    this.usuarioDto.senha = this.formulario.get('senha')?.value;
    this.usuarioDto.file  = this.nameFile;
  }

  submit() {
    console.log('submit');
    this.preenchendoUsuarioDto();
      if(this.nameFile != ''){
        this.onUpload();
      }
      this.cadastroUsuarioService.cadastroUsuario(this.usuarioDto).subscribe(
        sucess => this.formulario.reset(),
        error => console.log('error'),
        () => console.log('request completo')
      );
  }

}