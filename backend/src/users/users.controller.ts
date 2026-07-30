import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUserDto, ListUserFilterDto } from './dto/get-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo usuario' })
  @ApiOkResponse({ description: 'Usuario criado com sucesso.', type: ListUserDto })
  create(@Body() createUserDto: CreateUserDto): Promise<ListUserDto> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os usuarios' })
  @ApiOkResponse({ type: ListUserDto, isArray: true })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['ativo', 'inativo'],
    description: 'Filtra usuarios pelo status',
  })
  findAll(@Query() filter: ListUserFilterDto): Promise<ListUserDto[]> {
    return this.usersService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca usuario por id' })
  @ApiNotFoundResponse({ description: 'Usuario nao encontrado.' })
  @ApiOkResponse({ type: ListUserDto })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ListUserDto> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza dados ou status de um usuario' })
  @ApiNotFoundResponse({ description: 'Usuario nao encontrado.' })
  @ApiOkResponse({ type: ListUserDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ListUserDto> {
    return this.usersService.update(id, updateUserDto);
  }
}
